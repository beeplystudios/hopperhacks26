import { ChevronRightIcon } from "@/components/ui/icons";

const RestaurantCard: React.FC<{
  title: string;
  description: string;
  logo: string | null;
  id: string;
}> = ({ title, description, logo, id }) => {
  return (
    <div>
      <a href={`/restaurants/${id}`} className="h-full">
        <div className="p-3 rounded-lg shadow-md w-64 h-full flex flex-col cursor-pointer">
          <div className="flex flex-col items-start justify-start gap-2 flex-1">
            <div className="flex items-center justify-start gap-2">
              <h2 className="text-lg font-semibold text-left">{title}</h2>
              {logo && (
                <img src={logo} alt="Logo" className="w-6 h-6 rounded-full" />
              )}
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
    </div>
  );
};

export default RestaurantCard;
