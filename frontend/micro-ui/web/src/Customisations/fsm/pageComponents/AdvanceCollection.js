import React, { useEffect, useState } from "react";
import {
  LabelFieldPair,
  CardLabel,
  TextInput,
  Dropdown,
  Loader,
  CardLabelError,
} from "@egovernments/digit-ui-react-components";
import { useParams, useLocation } from "react-router-dom";

const Digit = window.Digit;

const AdvanceCollection = ({
  t,
  config,
  onSelect,
  formData,
  userType,
  FSMTextFieldStyle,
}) => {
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const state = Digit.ULBService.getStateId();
  const { pathname: url } = useLocation();
  let { id: applicationNumber } = useParams();
  const userInfo = Digit.UserService.getUser();
  const [TotalAmount, setTotalAmount] = useState();
  const [AdvanceAmount, setAdvanceAmounts] = useState();
  const {
    isLoading: applicationLoading,
    isError,
    data: applicationData,
    error,
  } = Digit.Hooks.fsm.useSearch(
    tenantId,
    { applicationNos: applicationNumber, uuid: userInfo.uuid },
    { staleTime: Infinity }
  );

  const [vehicle, setVehicle] = useState({
    label: formData?.tripData?.vehicleCapacity,
  });
  const [billError, setError] = useState(false);

  const { isLoading: isVehicleMenuLoading, data: vehicleData } =
    Digit.Hooks.fsm.useMDMS(state, "Vehicle", "VehicleType", {
      staleTime: Infinity,
    });

  const {
    data: dsoData,
    isLoading: isDsoLoading,
    isSuccess: isDsoSuccess,
    error: dsoError,
  } = Digit.Hooks.fsm.useDsoSearch(tenantId, {
    limit: -1,
    status: "ACTIVE",
  });

  const inputs = [
    {
      label: "ES_NEW_APPLICATION_ADVANCE_COLLECTION",
      type: "text",
      name: "advanceAmount",
      validation: {
        isRequired: true,
        min: "0",
        pattern: `^[0-9]+`,
        title: t("ES_NEW_APPLICATION_AMOUNT_INVALID"),
      },

      default: url.includes("modify")
        ? applicationData?.advanceAmount
        : formData?.advanceAmount,
      isMandatory: true,
    },
  ];
  function setValue(object) {
    onSelect(config.key, { ...formData[config.key], ...object });
  }
  function setAdvanceAmount(value) {
    onSelect(config.key, { ...formData[config.key], advanceAmount: value });
  }

  useEffect(() => {
    (async () => {
      if (formData?.tripData?.vehicleType !== vehicle) {
        setVehicle({ label: formData?.tripData?.vehicleType?.capacity });
      }
      Digit.SessionStorage.set(
        "total_amount",
        formData.tripData.amountPerTrip * formData.tripData.noOfTrips
      );
      debugger;
      Digit.SessionStorage.set(
        "advance_amount",
        formData?.advancepaymentPreference?.advanceAmount
      );
    })();
  }, [
    formData?.propertyType,
    formData?.subtype,
    formData?.address?.slum,
    formData?.tripData?.vehicleType?.capacity,
    formData?.tripData?.noOfTrips,
    formData?.advancepaymentPreference?.advanceAmount,
  ]);

  return isVehicleMenuLoading && isDsoLoading ? (
    <Loader />
  ) : (
    <div>
      {formData?.tripData?.amountPerTrip !== 0 &&
        inputs?.map((input, index) => {
          let currentValue =
            formData &&
            formData[config.key] &&
            formData[config.key][input.name];

          return (
            <React.Fragment key={index}>
              <LabelFieldPair key={index}>
                <CardLabel className="card-label-smaller">
                  {t(input.label) + " (₹)"}
                  {input.isMandatory ? " * " : null}
                </CardLabel>
                <div className="field">
                  <TextInput
                    disabled={url.includes("modify") ? true : false}
                    type={input.type}
                    key={input.name}
                    style={FSMTextFieldStyle}
                    onChange={(e) => setAdvanceAmount(e.target.value)}
                    value={
                      input.default
                        ? input.default
                        : formData && formData[config.key]
                        ? formData[config.key][input.name]
                        : 0
                    }
                    {...input.validation}
                  />
                  {currentValue > TotalAmount && (
                    <CardLabelError
                      style={{
                        width: "100%",
                        marginTop: "-15px",
                        fontSize: "14px",
                        marginBottom: "0px",
                      }}
                    >
                      {t("FSM_ADVANCE_AMOUNT_MAX")}
                    </CardLabelError>
                  )}
                  {!url.includes("modify-application") &&
                    currentValue < AdvanceAmount && (
                      <CardLabelError
                        style={{
                          width: "100%",
                          marginTop: "-15px",
                          fontSize: "14px",
                          marginBottom: "0px",
                        }}
                      >
                        {t("FSM_ADVANCE_AMOUNT_MIN")}
                      </CardLabelError>
                    )}
                  {/* {url.includes("modify-application") &&
                    Number(AdvanceAmount) === 0 &&
                    applicationData?.advanceAmount > 0 &&
                    Number(currentValue) === 0 && (
                      <CardLabelError
                        style={{
                          width: "100%",
                          marginTop: "-15px",
                          fontSize: "14px",
                          marginBottom: "0px",
                        }}
                      >
                        {t("FSM_ADVANCE_AMOUNT_NOT_ZERO")}
                      </CardLabelError>
                    )} */}
                </div>
              </LabelFieldPair>
            </React.Fragment>
          );
        })}
    </div>
  );
};

export default AdvanceCollection;
