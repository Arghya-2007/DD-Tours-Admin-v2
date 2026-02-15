import { Loader2 } from "lucide-react";

const Loader = () => {
    return (
        <div className="flex items-center justify-center h-screen bg-[#111827] text-white">
            <Loader2 className="animate-spin text-orange-500" size={48} />
        </div>
    );
};

export default Loader;