import React from "react";
import { Analytics01Icon } from "@hugeicons/core-free-icons";
import { UnderDevelopment } from "../../components/UI";

const ReportsPage = () => {
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <UnderDevelopment
        pageName="Hisobotlar"
        title="Hisobotlar va Tahlillar bo‘limi"
        subtitle="Yig‘ilishlar statistikasi, ishtirokchilar faolligi va davomat bo‘yicha batafsil hisobotlarni shakllantirish moduli hozirda ishlab chiqilmoqda."
        icon={Analytics01Icon}
        badgeText="Ishlab chiqish jarayonida"
        progress={65}
        estimatedDate="Aprel 2026"
        features={[
          "Yig‘ilishlar va ishtirokchilar bo‘yicha batafsil hisobotlar",
          "Excel, PDF va CSV formatlarida eksport qilish imkoniyati",
          "Sana, tashkilot va xodimlar bo‘yicha filtrlash va diagrammalar",
          "Davriy (haftalik, oylik) hisobotlarni avtomatlashtirish",
        ]}
      />
    </div>
  );
};

export default ReportsPage;