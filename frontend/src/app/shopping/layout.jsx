import CategorySidebar from "./components/CategorySidebar";

export default function Layout({ children }) {
  return (
    <section className="flex justify-between gap-4">
      <div className=" max-h-[90vh] w-64">
        <CategorySidebar />
      </div>
      <div className="w-full">{children}</div>
    </section>
  );
}
