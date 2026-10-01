import React from "react";
import { Settings01Icon } from "@hugeicons/core-free-icons";
import { UnderDevelopment } from "../../components/UI";

const Setting = () => {
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <UnderDevelopment
        pageName="Sozlamalar"
        title="Tizim va Xavfsizlik sozlamalari"
        subtitle="Tizim parametrlari, bildirishnomalar tartibi, integratsiyalar va umumiy konfiguratsiyalarni boshqarish bo‘limi tez orada ishga tushadi."
        icon={Settings01Icon}
        badgeText="Ishlab chiqish jarayonida"
        progress={80}
        estimatedDate="Tez orada"
        features={[
          "Tizim umumiy konfiguratsiyasi va til tanlash",
          "Bildirishnomalar, SMS va Email xabarnomalarini sozlash",
          "Tashqi xizmatlar va API integratsiyalari boshqaruvi",
          "Foydalanuvchi rollari va xavfsizlik siyosatlari",
        ]}
      />
    </div>
  );
};

export default Setting;