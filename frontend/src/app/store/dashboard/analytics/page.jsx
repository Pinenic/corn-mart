"use client"
import { SiteHeader } from "@/components/site-header";
import { useStoreStore } from "@/store/useStore";

export default function Page() {
    const {store} = useStoreStore();
    const storeId = store?.id;
    return (
        <>
        <SiteHeader title={"Analytics"} storeId={storeId} />
        <div>Analytics coming soon</div></>
        
    );
}