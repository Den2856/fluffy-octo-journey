import { type IconType } from 'react-icons'; 

interface ServiceCardProps {
  icon: IconType;
  title: string;
  description: string;
}

export default function FleetServices({ icon: Icon, title, description }: ServiceCardProps) {
  return (
    <div className="w-full">
      <div className="size-full flex flex-col items-center border border-white/10 p-6 bg-dark-200 hover:bg-dark-100 transition-colors duration-300">
        <div className="mb-4">
          <Icon size={24} className="text-primary" />
        </div>

        <h3 className="text-[20px] text-white mb-2">{title}</h3>
        <p className="text-white/80 text-center">{description}</p>
      </div>
    </div>
  );
}
