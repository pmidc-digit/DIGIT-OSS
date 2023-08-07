import React from "react";
import { useTranslation } from "react-i18next";
import { Loader } from "@egovernments/digit-ui-react-components";

const Header = () => {
  const { data: storeData, isLoading } = Digit.Hooks.useStore.getInitData();
  const { stateInfo } = storeData || {};
  const { t } = useTranslation();

  if (isLoading) return <Loader />;

  return (
    <div className="bannerHeader" style={{ display: "flex", justifyContent: "space-between" }}>
      <img style={{ width: "180px" }} src={stateInfo?.logoUrl} alt="Digit" />
      {/* <p>{t(`TENANT_TENANTS_${stateInfo?.code.toUpperCase()}`)}</p> */}
      <img style={{ height: "40px" }} src={stateInfo?.pmidcLogoUrl} alt="PMIDC" />
    </div>
  );
};

export default Header;
