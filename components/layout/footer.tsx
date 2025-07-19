// components/Footer.tsx
export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-black to-gray-800 text-gray-400 mix-blend-difference py-20 text-center text-sm">
      © {new Date().getFullYear()}/ {new Date().getMonth() + 1}/ {new Date().getDate()}{" "}
      {new Date().getHours()} Design Gallery. جميع الحقوق محفوظة.
    </footer>
  );
}
