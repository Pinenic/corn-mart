"use client"
import Link from "next/link";

// Breadcrumb Component
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";

export function AutoBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const paths = segments.map((seg, index) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " "),
    href: "/" + segments.slice(0, index + 1).join("/"),
  }));

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>

        {paths.map((p, i) => (
          <div key={i} className="flex gap-2 items-center">
            <BreadcrumbSeparator />
            <BreadcrumbItem key={p.href}>
              <BreadcrumbLink href={p.href}>{p.label}</BreadcrumbLink>
            </BreadcrumbItem>
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
// {
//   return (
//     <nav className="text-sm text-muted-foreground flex items-center gap-1 mb-4">
//       {items.map((item, i) => (
//         <span key={i} className="flex items-center gap-1">
//           {i > 0 && <span>/</span>}
//           {item.href ? (
//             <Link href={item.href} className="hover:text-foreground transition">
//               {item.label}
//             </Link>
//           ) : (
//             <span className="text-foreground font-medium">{item.label}</span>
//           )}
//         </span>
//       ))}
//     </nav>
//   );
// }
