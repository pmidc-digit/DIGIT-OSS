import {
  CardLabel,
  Dropdown,
  LabelFieldPair,
  Loader,
  TextInput,
  CardLabelError,
  CheckBox,
} from "@egovernments/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import { getPattern } from "../../utils";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import _, { keys } from "lodash";
// import * as func from "../utils";

var Digit = window.Digit || {};

const createConnectionDetails = () => ({
  water: true,
  sewerage: false,

  proposedPipeSize: "",
  proposedTaps: "",
  proposedToilets: "",
  proposedWaterClosets: "",
  connectionType: "",
  billingType: "",
  connectionCategory: "",
  waterSource: "",
  billingAmount: "",
  ledgerId: "",
});

const WSConnectionDetails = ({
  config,
  onSelect,
  userType,
  formData,
  setError,
  formState,
  clearErrors,
}) => {
  console.log(config, "rakesh config");
  console.log(formData, "rakesh formData");
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const [connectionDetails, setConnectionDetails] = useState(
    formData?.ConnectionDetails
      ? [formData?.ConnectionDetails?.[0]]
      : [createConnectionDetails()]
  );
  const [focusIndex, setFocusIndex] = useState({ index: -1, type: "" });
  const stateCode = Digit.ULBService.getStateId();
  const [isErrors, setIsErrors] = useState(false);
  const [waterSewarageSelection, setWaterSewarageSelection] = useState({
    water: true,
    sewerage: false,
  });

  const [pipeSizeList, setPipesizeList] = useState([]);
  const [connectionTypeList, setConnectionTypeList] = useState([]);
  const [billingTypeList, setBillingTypeList] = useState([]);
  const [connectionCategoryList, setConnectionCatgoryList] = useState([]);
  const [waterSourceList, setWaterSourceList] = useState([]);

  const { isWSServicesCalculationLoading, data: wsServicesCalculationData } =
    Digit.Hooks.ws.useMDMS(stateCode, "ws-services-calculation", ["PipeSize"]);

  const { data: wsServiceMastersData } = Digit.Hooks.ws.useMDMS(
    stateCode,
    "ws-services-masters",
    [
      "connectionType",
      "billingType",
      "connectionCategory",
      "waterSource",
      "subUsageType",
    ]
  );

  console.log(wsServiceMastersData, "rakesh wwwwww");

  useEffect(() => {
    const data = connectionDetails.map((e) => {
      return e;
    });
    onSelect(config?.key, data);
  }, [connectionDetails]);

  useEffect(() => {
    const list =
      wsServicesCalculationData?.["ws-services-calculation"]?.PipeSize || [];
    list?.forEach((data) => (data.i18nKey = data.size));
    setPipesizeList(list);
  }, [wsServicesCalculationData]);

  useEffect(() => {
    const connectionTypeDropdownData = wsServiceMastersData?.[
      "ws-services-masters"
    ]?.connectionType?.filter((data) => data.code == "Non Metered");
    setConnectionTypeList(connectionTypeDropdownData);
    const billingTypeDropdownData = wsServiceMastersData?.[
      "ws-services-masters"
    ]?.billingType?.map((data) => data);
    setBillingTypeList(billingTypeDropdownData);
    const connectionCategoryDropdownData = wsServiceMastersData?.[
      "ws-services-masters"
    ]?.connectionCategory?.map((data) => data);
    setConnectionCatgoryList(connectionCategoryDropdownData);
    const waterSourceDropdownData = wsServiceMastersData?.[
      "ws-services-masters"
    ]?.waterSource?.map((data) => data);
    setWaterSourceList(waterSourceDropdownData);
  }, [wsServiceMastersData]);

  useEffect(() => {
    if (userType === "employee") {
      onSelect(config.key, { ...formData[config.key], ...connectionDetails });
    }
    if (connectionDetails?.[0]?.water)
      setWaterSewarageSelection({ water: true, sewerage: false });

    if (connectionDetails?.[0]?.sewerage)
      setWaterSewarageSelection({ water: false, sewerage: true });
  }, [connectionDetails]);

  useEffect(() => {
    if (!formData?.ConnectionDetails) {
      setConnectionDetails([createConnectionDetails()]);
    }
  }, [formData?.ConnectionDetails]);

  if (isWSServicesCalculationLoading) return <Loader />;

  const commonProps = {
    focusIndex,
    connectionDetails,
    setFocusIndex,
    formData,
    formState,
    t,
    setError,
    clearErrors,
    config,
    setConnectionDetails,
    setIsErrors,
    isErrors,
    pipeSizeList,
    connectionTypeList,
    billingTypeList,
    connectionCategoryList,
    waterSourceList,
    wsServiceMastersData,
    wsServicesCalculationData,
    waterSewarageSelection,
    formData,
  };

  return (
    <React.Fragment>
      {connectionDetails.map((connectionDetail, index) => (
        <ConnectionDetails
          key={connectionDetail.key}
          index={index}
          connectionDetail={connectionDetail}
          {...commonProps}
        />
      ))}
    </React.Fragment>
  );
};

const ConnectionDetails = (_props) => {
  const {
    connectionDetail,
    focusIndex,
    setFocusIndex,
    t,
    config,
    setError,
    clearErrors,
    formState,
    setIsErrors,
    isErrors,
    connectionTypeList,
    billingTypeList,
    connectionCategoryList,
    waterSourceList,
    setConnectionDetails,
    wsServiceMastersData,
    wsServicesCalculationData,
    pipeSizeList,
    connectionDetails,
    waterSewarageSelection,
    formData,
  } = _props;

  const {
    control,
    formState: localFormState,
    watch,
    setError: setLocalError,
    clearErrors: clearLocalErrors,
    setValue,
    trigger,
    getValues,
  } = useForm();
  const formValue = watch();
  const { errors } = localFormState;

  useEffect(() => {
    trigger();
  }, []);

  useEffect(() => {
    if (Object.entries(formValue).length > 0) {
      const keys = Object.keys(formValue);
      const part = {};
      keys.forEach((key) => (part[key] = connectionDetail[key]));
      if (!_.isEqual(formValue, part)) {
        let isErrorsFound = true;
        Object.keys(formValue).map((data) => {
          if (!formValue[data] && isErrorsFound) {
            isErrorsFound = false;
            setIsErrors(false);
          }
        });
        if (isErrorsFound) setIsErrors(true);
        let ob = [{ ...formValue }];
        setConnectionDetails(ob);
        trigger();
      }
    }
  }, [formValue, connectionDetails]);

  useEffect(() => {
    let isClear = true;
    Object.keys(connectionDetails?.[0])?.map((data) => {
      if (
        !connectionDetails[0][data] &&
        connectionDetails[0][data] != false &&
        isClear
      )
        isClear = false;
    });
    if (isClear && Object.keys(connectionDetails?.[0])?.length > 1) {
      clearErrors("ConnectionDetails");
    }

    if (!connectionDetails?.[0]?.sewerage) {
      clearErrors(config.key, { type: "proposedToilets" });
      clearErrors(config.key, { type: "proposedWaterClosets" });
    }

    if (!connectionDetails?.[0]?.water) {
      clearErrors(config.key, { type: "proposedPipeSize" });
      clearErrors(config.key, { type: "proposedTaps" });
    }
    trigger();
  }, [
    connectionDetails,
    waterSewarageSelection,
    formData?.DocumentsRequired?.documents,
  ]);

  useEffect(() => {
    if (
      Object.keys(errors).length &&
      !_.isEqual(formState.errors[config.key]?.type || {}, errors)
    ) {
      setError(config.key, { type: errors });
    } else if (
      !Object.keys(errors).length &&
      formState.errors[config.key] &&
      isErrors
    ) {
      clearErrors(config.key);
    }
  }, [errors]);

  const errorStyle = {
    width: "70%",
    marginLeft: "30%",
    fontSize: "12px",
    marginTop: "-21px",
  };
  const isMobile = window.Digit.Utils.browser.isMobile();
  const titleStyle = isMobile
    ? {
        marginBottom: "40px",
        color: "#505A5F",
        fontWeight: "700",
        fontSize: "16px",
      }
    : {
        marginTop: "-40px",
        marginBottom: "40px",
        color: "#505A5F",
        fontWeight: "700",
        fontSize: "16px",
      };
  return (
    <div>
      {/* {window.location.href.includes("/ws/new") ?  <div style={titleStyle}>{t("WS_CONNECTION_DETAILS_HEADER_SUB_TEXT_LABEL")}</div> : null} */}
      <div style={{ marginBottom: "16px" }}>
        <CardLabel style={{ fontWeight: "700" }}>{`${t(
          "WS_APPLY_FOR"
        )}`}</CardLabel>
        <div style={{ display: "flex", gap: "0 3rem" }}>
          <Controller
            control={control}
            name="water"
            defaultValue={connectionDetail?.water}
            isMandatory={true}
            render={(props) => (
              <CheckBox
                label={t("WATER_CONNECTION")}
                name={"water"}
                autoFocus={
                  focusIndex.index === connectionDetail?.key &&
                  focusIndex.type === "water"
                }
                errorStyle={
                  localFormState.touched.water && errors?.water?.message
                    ? true
                    : false
                }
                onChange={(e) => {
                  if (e.target.checked || connectionDetail?.sewerage) {
                    props.onChange(e.target.checked);
                    setFocusIndex({
                      index: connectionDetail?.key,
                      type: "water",
                    });
                  }
                }}
                checked={connectionDetail?.water}
                style={{ paddingBottom: "10px", paddingTop: "3px" }}
                onBlur={props.onBlur}
              />
            )}
          />
          <Controller
            control={control}
            name="sewerage"
            defaultValue={connectionDetail?.sewerage}
            type="number"
            isMandatory={true}
            render={(props) => (
              <CheckBox
                label={t("SEWERAGE_CONNECTION")}
                name={"sewerage"}
                autoFocus={
                  focusIndex.index === connectionDetail?.key &&
                  focusIndex.type === "sewerage"
                }
                errorStyle={
                  localFormState.touched.sewerage && errors?.sewerage?.message
                    ? true
                    : false
                }
                onChange={(e) => {
                  if (e.target.checked || connectionDetail?.water) {
                    props.onChange(e.target.checked);
                    setFocusIndex({
                      index: connectionDetail?.key,
                      type: "sewerage",
                    });
                  }
                }}
                checked={connectionDetail?.sewerage}
                style={{ paddingBottom: "10px", paddingTop: "3px" }}
                onBlur={props.onBlur}
              />
            )}
          />
        </div>
        {connectionDetail?.water && (
          <div>
            <LabelFieldPair>
              <CardLabel
                style={{ marginTop: "-5px", fontWeight: "700" }}
                className="card-label-smaller"
              >{`${t("WS_NO_OF_PROPOSED_TAPS_LABEL")}*`}</CardLabel>
              <div className="field">
                <Controller
                  control={control}
                  name="proposedTaps"
                  defaultValue={connectionDetail?.proposedTaps}
                  rules={{
                    validate: (e) =>
                      (parseInt(e) > 0 &&
                        e &&
                        getPattern("WSOnlyNumbers").test(e)) ||
                      !e
                        ? true
                        : t("ERR_DEFAULT_INPUT_FIELD_MSG"),
                    required: t("REQUIRED_FIELD"),
                  }}
                  type="number"
                  isMandatory={true}
                  render={(props) => (
                    <TextInput
                      type="number"
                      value={props.value}
                      autoFocus={
                        focusIndex.index === connectionDetail?.key &&
                        focusIndex.type === "proposedTaps"
                      }
                      errorStyle={
                        localFormState.touched.proposedTaps &&
                        errors?.proposedTaps?.message
                          ? true
                          : false
                      }
                      onChange={(e) => {
                        props.onChange(e.target.value);
                        setFocusIndex({
                          index: connectionDetail?.key,
                          type: "proposedTaps",
                        });
                      }}
                      labelStyle={{ marginTop: "unset" }}
                      onBlur={props.onBlur}
                    />
                  )}
                />
              </div>
            </LabelFieldPair>
            <CardLabelError style={errorStyle}>
              {localFormState.touched.proposedTaps
                ? errors?.proposedTaps?.message
                : ""}
            </CardLabelError>
            <LabelFieldPair>
              <CardLabel
                style={{ marginTop: "-5px", fontWeight: "700" }}
                className="card-label-smaller"
              >{`${t("WS_PROPOSED_PIPE_SIZE_IN_INCHES_LABEL")}*`}</CardLabel>
              <Controller
                control={control}
                name={"proposedPipeSize"}
                defaultValue={connectionDetail?.proposedPipeSize}
                rules={{ required: t("REQUIRED_FIELD") }}
                isMandatory={true}
                render={(props) => (
                  <Dropdown
                    className="form-field"
                    selected={getValues("proposedPipeSize")}
                    disable={false}
                    option={pipeSizeList}
                    errorStyle={
                      localFormState.touched.proposedPipeSize &&
                      errors?.proposedPipeSize?.message
                        ? true
                        : false
                    }
                    select={(e) => {
                      props.onChange(e);
                    }}
                    optionKey="i18nKey"
                    onBlur={props.onBlur}
                    t={t}
                  />
                )}
              />
            </LabelFieldPair>
            <CardLabelError style={errorStyle}>
              {localFormState.touched.proposedPipeSize
                ? errors?.proposedPipeSize?.message
                : ""}
            </CardLabelError>
            <LabelFieldPair>
              <CardLabel
                style={{ marginTop: "-5px", fontWeight: "700" }}
                className="card-label-smaller"
              >{`${t("WS_CONNECTION_TYPE_LABEL")}*`}</CardLabel>
              <Controller
                control={control}
                name={"connectionType"}
                defaultValue={connectionDetail?.connectionType}
                rules={{ required: t("REQUIRED_FIELD") }}
                isMandatory={true}
                render={(props) => (
                  <Dropdown
                    className="form-field"
                    selected={getValues("connectionType")}
                    disable={false}
                    option={connectionTypeList}
                    errorStyle={
                      localFormState.touched.connectionType &&
                      errors?.connectionType?.message
                        ? true
                        : false
                    }
                    select={(e) => {
                      props.onChange(e);
                    }}
                    optionKey="code"
                    onBlur={props.onBlur}
                    t={t}
                  />
                )}
              />
            </LabelFieldPair>
            <CardLabelError style={errorStyle}>
              {localFormState.touched.connectionType
                ? errors?.connectionType?.message
                : ""}
            </CardLabelError>
            <LabelFieldPair>
              <CardLabel
                style={{ marginTop: "-5px", fontWeight: "700" }}
                className="card-label-smaller"
              >{`${t("WS_BILLING_TYPE_LABEL")}*`}</CardLabel>
              <Controller
                control={control}
                name={"billingType"}
                defaultValue={connectionDetail?.billingType}
                rules={{ required: t("REQUIRED_FIELD") }}
                isMandatory={true}
                render={(props) => (
                  <Dropdown
                    className="form-field"
                    selected={getValues("billingType")}
                    disable={false}
                    option={billingTypeList}
                    errorStyle={
                      localFormState.touched.billingType &&
                      errors?.billingType?.message
                        ? true
                        : false
                    }
                    select={(e) => {
                      props.onChange(e);
                    }}
                    optionKey="code"
                    onBlur={props.onBlur}
                    t={t}
                  />
                )}
              />
            </LabelFieldPair>
            <CardLabelError style={errorStyle}>
              {localFormState.touched.billingType
                ? errors?.billingType?.message
                : ""}
            </CardLabelError>
            {formData?.ConnectionDetails &&
              formData.ConnectionDetails[0]?.billingType?.code !==
                "STANDARD" && (
                <div>
                  <LabelFieldPair>
                    <CardLabel
                      style={{ marginTop: "-5px", fontWeight: "700" }}
                      className="card-label-smaller"
                    >{`${t("WS_BILLING_AMOUNT_LABEL")}*`}</CardLabel>
                    <div className="field">
                      <Controller
                        control={control}
                        name="billingAmount"
                        defaultValue={connectionDetail?.billingAmount}
                        rules={{
                          validate: (e) =>
                            (parseInt(e) > 0 &&
                              e &&
                              getPattern("WSOnlyNumbers").test(e)) ||
                            !e
                              ? true
                              : t("ERR_DEFAULT_INPUT_FIELD_MSG"),
                          required: t("REQUIRED_FIELD"),
                        }}
                        type="number"
                        isMandatory={true}
                        render={(props) => (
                          <TextInput
                            type="number"
                            value={props.value}
                            autoFocus={
                              focusIndex.index === connectionDetail?.key &&
                              focusIndex.type === "billingAmount"
                            }
                            errorStyle={
                              localFormState.touched.billingAmount &&
                              errors?.billingAmount?.message
                                ? true
                                : false
                            }
                            onChange={(e) => {
                              props.onChange(e.target.value);
                              setFocusIndex({
                                index: connectionDetail?.key,
                                type: "billingAmount",
                              });
                            }}
                            labelStyle={{ marginTop: "unset" }}
                            onBlur={props.onBlur}
                          />
                        )}
                      />
                    </div>
                  </LabelFieldPair>
                  <CardLabelError style={errorStyle}>
                    {localFormState.touched.billingAmount
                      ? errors?.billingAmount?.message
                      : ""}
                  </CardLabelError>{" "}
                </div>
              )}
            <LabelFieldPair>
              <CardLabel
                style={{ marginTop: "-5px", fontWeight: "700" }}
                className="card-label-smaller"
              >{`${t("WS_CONNECTION_CATEGORY_LABEL")}*`}</CardLabel>
              <Controller
                control={control}
                name={"connectionCategory"}
                defaultValue={connectionDetail?.connectionCategory}
                rules={{ required: t("REQUIRED_FIELD") }}
                isMandatory={true}
                render={(props) => (
                  <Dropdown
                    className="form-field"
                    selected={getValues("connectionCategory")}
                    disable={false}
                    option={connectionCategoryList}
                    errorStyle={
                      localFormState.touched.connectionCategory &&
                      errors?.connectionCategory?.message
                        ? true
                        : false
                    }
                    select={(e) => {
                      props.onChange(e);
                    }}
                    optionKey="code"
                    onBlur={props.onBlur}
                    t={t}
                  />
                )}
              />
            </LabelFieldPair>
            <CardLabelError style={errorStyle}>
              {localFormState.touched.connectionCategory
                ? errors?.connectionCategory?.message
                : ""}
            </CardLabelError>
            <LabelFieldPair>
              <CardLabel
                style={{ marginTop: "-5px", fontWeight: "700" }}
                className="card-label-smaller"
              >{`${t("WS_WATER_SOURCE_LABEL")}*`}</CardLabel>
              <Controller
                control={control}
                name={"waterSource"}
                defaultValue={connectionDetail?.waterSource}
                rules={{ required: t("REQUIRED_FIELD") }}
                isMandatory={true}
                render={(props) => (
                  <Dropdown
                    className="form-field"
                    selected={getValues("waterSource")}
                    disable={false}
                    option={waterSourceList}
                    errorStyle={
                      localFormState.touched.waterSource &&
                      errors?.waterSource?.message
                        ? true
                        : false
                    }
                    select={(e) => {
                      props.onChange(e);
                    }}
                    optionKey="code"
                    onBlur={props.onBlur}
                    t={t}
                  />
                )}
              />
            </LabelFieldPair>
            <CardLabelError style={errorStyle}>
              {localFormState.touched.waterSource
                ? errors?.waterSource?.message
                : ""}
            </CardLabelError>
            <LabelFieldPair>
              <CardLabel
                style={{ marginTop: "-5px", fontWeight: "700" }}
                className="card-label-smaller"
              >{`${t("WS_LEDGER_ID_LABEL")}*`}</CardLabel>
              <div className="field">
                <Controller
                  control={control}
                  name="ledgerId"
                  defaultValue={connectionDetail?.ledgerId}
                  rules={{
                    validate: (e) =>
                      (parseInt(e) > 0 &&
                        e &&
                        getPattern("WSOnlyNumbers").test(e)) ||
                      !e
                        ? true
                        : t("ERR_DEFAULT_INPUT_FIELD_MSG"),
                    required: t("REQUIRED_FIELD"),
                  }}
                  type="number"
                  isMandatory={true}
                  render={(props) => (
                    <TextInput
                      type="number"
                      value={props.value}
                      autoFocus={
                        focusIndex.index === connectionDetail?.key &&
                        focusIndex.type === "ledgerId"
                      }
                      errorStyle={
                        localFormState.touched.ledgerId &&
                        errors?.ledgerId?.message
                          ? true
                          : false
                      }
                      onChange={(e) => {
                        props.onChange(e.target.value);
                        setFocusIndex({
                          index: connectionDetail?.key,
                          type: "ledgerId",
                        });
                      }}
                      labelStyle={{ marginTop: "unset" }}
                      onBlur={props.onBlur}
                    />
                  )}
                />
              </div>
            </LabelFieldPair>
          </div>
        )}
        {connectionDetail?.sewerage && (
          <div>
            <LabelFieldPair>
              <CardLabel
                style={{ marginTop: "-5px", fontWeight: "700" }}
                className="card-label-smaller"
              >{`${t("WS_PROPOSED_WATER_CLOSETS_LABEL")}*`}</CardLabel>
              <div className="field">
                <Controller
                  control={control}
                  name="proposedWaterClosets"
                  defaultValue={connectionDetail?.proposedWaterClosets}
                  rules={{
                    validate: (e) =>
                      (parseInt(e) > 0 &&
                        e &&
                        getPattern("WSOnlyNumbers").test(e)) ||
                      !e
                        ? true
                        : t("ERR_DEFAULT_INPUT_FIELD_MSG"),
                    required: t("REQUIRED_FIELD"),
                  }}
                  type="number"
                  isMandatory={true}
                  render={(props) => (
                    <TextInput
                      type="number"
                      value={props.value}
                      autoFocus={
                        focusIndex.index === connectionDetail?.key &&
                        focusIndex.type === "proposedWaterClosets"
                      }
                      errorStyle={
                        localFormState.touched.proposedWaterClosets &&
                        errors?.proposedWaterClosets?.message
                          ? true
                          : false
                      }
                      onChange={(e) => {
                        props.onChange(e.target.value);
                        setFocusIndex({
                          index: connectionDetail?.key,
                          type: "proposedWaterClosets",
                        });
                      }}
                      labelStyle={{ marginTop: "unset" }}
                      onBlur={props.onBlur}
                    />
                  )}
                />
              </div>
            </LabelFieldPair>
            <CardLabelError style={errorStyle}>
              {localFormState.touched.proposedWaterClosets
                ? errors?.proposedWaterClosets?.message
                : ""}
            </CardLabelError>
            <LabelFieldPair>
              <CardLabel
                style={{ marginTop: "-5px", fontWeight: "700" }}
                className="card-label-smaller"
              >{`${t("WS_PROPOSED_WATER_TOILETS_LABEL")}*`}</CardLabel>
              <div className="field">
                <Controller
                  control={control}
                  name="proposedToilets"
                  defaultValue={connectionDetail?.proposedToilets}
                  rules={{
                    validate: (e) =>
                      (parseInt(e) > 0 &&
                        e &&
                        getPattern("WSOnlyNumbers").test(e)) ||
                      !e
                        ? true
                        : t("ERR_DEFAULT_INPUT_FIELD_MSG"),
                    required: t("REQUIRED_FIELD"),
                  }}
                  type="number"
                  isMandatory={true}
                  render={(props) => (
                    <TextInput
                      type="number"
                      value={props.value}
                      autoFocus={
                        focusIndex.index === connectionDetail?.key &&
                        focusIndex.type === "proposedToilets"
                      }
                      errorStyle={
                        localFormState.touched.proposedToilets &&
                        errors?.proposedToilets?.message
                          ? true
                          : false
                      }
                      onChange={(e) => {
                        props.onChange(e.target.value);
                        setFocusIndex({
                          index: connectionDetail?.key,
                          type: "proposedToilets",
                        });
                      }}
                      labelStyle={{ marginTop: "unset" }}
                      onBlur={props.onBlur}
                    />
                  )}
                />
              </div>
            </LabelFieldPair>
            <CardLabelError style={errorStyle}>
              {localFormState.touched.proposedToilets
                ? errors?.proposedToilets?.message
                : ""}
            </CardLabelError>
          </div>
        )}
      </div>
    </div>
  );
};

export default WSConnectionDetails;
