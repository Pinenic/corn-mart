export const metadata = {
  title: "Corn Mart | Auth",
};

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50/50 to-blue-100/50">
      <div className="bg-white dark:bg-muted shadow-xl rounded-2xl p-8 w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
