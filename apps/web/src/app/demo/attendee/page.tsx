import { redirect } from "next/navigation";

export default function DemoAttendeePage() {
  redirect("/hackathon");
}

function Feature({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <li className="flex items-start gap-3 rounded-lg bg-sunken p-4">
      <span className="text-xl">{icon}</span>
      <div>
        <p className="text-sm font-medium text-primary">{title}</p>
        <p className="text-xs text-secondary">{description}</p>
      </div>
    </li>
  );
}
