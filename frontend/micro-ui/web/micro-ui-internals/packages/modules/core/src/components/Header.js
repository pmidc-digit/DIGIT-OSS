import React from "react";
import { useTranslation } from "react-i18next";
import { Loader } from "@egovernments/digit-ui-react-components";

const Header = () => {
  const { data: storeData, isLoading } = Digit.Hooks.useStore.getInitData();
  const { stateInfo } = storeData || {};
  const { t } = useTranslation();

  if (isLoading) return <Loader />;

  return (
    <div className="bannerHeader">
      <div style={{ display: "flex" }}>
        <img className="bannerLogo" src={stateInfo?.logoUrl} alt="Digit" />
        {/* <p>{t(`TENANT_TENANTS_${stateInfo?.code.toUpperCase()}`)}</p> */}
      </div>
      <img style={{ height: "40px" }} src={stateInfo?.pmidcLogoUrl} alt="PMIDC" />
    </div>
  );
};

export default Header;
