import React from "react";
import { Clock04Icon } from "@hugeicons/core-free-icons";
import { UnderDevelopment } from "../../components/UI";

const Logs = () => {
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <UnderDevelopment
        pageName="Umumiy tarix"
        title="Umumiy tarix va Audit loglari"
        subtitle="Tizimda amalga oshirilgan barcha harakatlar, yig‘ilishlar o‘zgarishi va xavfsizlik audit qaydlarini kuzatish sahifasi tez kunda ishga tushadi."
        icon={Clock04Icon}
        badgeText="Ishlab chiqish jarayonida"
        progress={70}
        estimatedDate="Aprel 2026"
        features={[
          "Foydalanuvchilar harakatlari va tizimga kirishlar auditi",
          "Yig‘ilishlar bo‘yicha amalga oshirilgan barcha tahrirlar tarixi",
          "IP manzil, sana va harakat turi bo‘yicha tezkor qidiruv",
          "Xavfsizlik hodisalari va muhim tizim ogohlantirishlari",
        ]}
      />
    </div>
  );
};

export default Logs;