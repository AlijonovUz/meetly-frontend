import React from "react";
import { UserCircleIcon } from "@hugeicons/core-free-icons";
import { UnderDevelopment } from "../../components/UI";

const Profile = () => {
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <UnderDevelopment
        pageName="Foydalanuvchi profili"
        title="Shaxsiy profil va Ma‘lumotlar"
        subtitle="Shaxsiy ma‘lumotlarni tahrirlash, xavfsizlik sozlamalari, parolni yangilash va faol seanslarni boshqarish sahifasi tez orada ishga tushadi."
        icon={UserCircleIcon}
        badgeText="Ishlab chiqish jarayonida"
        progress={85}
        estimatedDate="Tez orada"
        features={[
          "Shaxsiy ma‘lumotlar, lavozim va aloqa vositalarini boshqarish",
          "Parol o‘zgartirish va 2-bosqichli autentifikatsiya (2FA)",
          "Faol qurilmalar va sessiyalar ro‘yxatini nazorat qilish",
          "Shaxsiy bildirishnomalar va qulaylik parametrlarini sozlash",
        ]}
      />
    </div>
  );
};

export default Profile;