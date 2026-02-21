import { ChevronRightIcon } from "@/components/ui/icons";

const RestaurantCard: React.FC<{
  title: string;
  description: string;
  logo: string | null;
  id: string;
}> = ({ title, description, logo, id }) => {
  return (
    <a href={`/restaurant/${id}`}>
      <div className="p-6 rounded-xl shadow-md aspect-square min-w-64 w-64 group flex flex-col cursor-pointer">
        <div className="flex flex-col items-start justify-start gap-3 flex-1">
          <div className="flex items-center justify-start gap-2">
            {/* {logo && (
          <div className="w-6 h-6 rounded-full o">
            <img src={logo} alt="Logo" className="object-fill" />
          </div>
        )} */}
            <h2 className="text-2xl font-bold text-left">{title}</h2>
          </div>
          <p className="text-gray-600 overflow-hidden text-left text-ellipsis line-clamp-3">
            {description}
          </p>
        </div>
        <div className="w-full self-end flex items-center justify-end group-hover:font-bold transition-all">
          See More <ChevronRightIcon />
        </div>
      </div>
    </a>
  );
};

export default RestaurantCard;
