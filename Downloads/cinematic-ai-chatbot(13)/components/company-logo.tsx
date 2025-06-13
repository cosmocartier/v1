import Image from "next/image"

interface CompanyLogoProps {
  company: "microsoft" | "google" | "amazon" | "salesforce" | "adobe"
  className?: string
}

export function CompanyLogo({ company, className = "h-8 w-auto" }: CompanyLogoProps) {
  const logos = {
    microsoft: "/images/logos/microsoft.png",
    google: "/images/logos/google.png",
    amazon: "/images/logos/amazon.png",
    salesforce: "/images/logos/salesforce.png",
    adobe: "/images/logos/adobe.png",
  }

  const companyNames = {
    microsoft: "Microsoft",
    google: "Google",
    amazon: "Amazon",
    salesforce: "Salesforce",
    adobe: "Adobe",
  }

  return (
    <Image
      src={logos[company] || "/placeholder.svg"}
      alt={`${companyNames[company]} logo`}
      width={120}
      height={60}
      className={`${className} opacity-70 grayscale transition-all hover:opacity-100 hover:grayscale-0`}
    />
  )
}
