"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Check,
  ChevronRight,
  Menu,
  X,
  Moon,
  Sun,
  ArrowRight,
  Star,
  Shield,
  BarChart,
  Brain,
  Target,
  TrendingUp,
  Globe,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTheme } from "next-themes"
import { useAuth } from "@/lib/auth-context"
import { UserAccountDropdown } from "@/components/user-account-dropdown"
import { AnimatedDashboard } from "@/components/animated-dashboard"
import { CompanyLogo } from "@/components/company-logo"
import { MELogo } from "@/components/me-logo"

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const getStartedAction = () => {
    if (user) {
      return (
        <Link href="/chat">
          <Button
            size="lg"
            className="rounded-full h-12 px-8 text-base bg-gradient-to-r from-me-500 to-me-600 hover:from-me-600 hover:to-me-700 border-0"
          >
            Access Platform
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </Link>
      )
    }
    return (
      <Link href="/auth/signup">
        <Button
          size="lg"
          className="rounded-full h-12 px-8 text-base bg-gradient-to-r from-me-500 to-me-600 hover:from-me-600 hover:to-me-700 border-0"
        >
          Get Started
          <ArrowRight className="ml-2 size-4" />
        </Button>
      </Link>
    )
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  }

  const features = [
    {
      title: "Strategic Roadmaps",
      description:
        "AI-driven strategic roadmaps with clear implementation steps and success metrics. Visualize your strategic path.",
      icon: <TrendingUp className="size-6" />,
    },
    {
      title: "Competitive Intelligence",
      description:
        "Real-time competitive analysis and market insights. Stay ahead of the competition with data-driven decisions.",
      icon: <Globe className="size-6" />,
    },
    {
      title: "Risk Assessment",
      description:
        "Identify and mitigate potential risks with advanced risk assessment tools. Protect your strategic initiatives.",
      icon: <Shield className="size-6" />,
    },
    {
      title: "Performance Analytics",
      description:
        "Track and measure strategic performance with comprehensive analytics. Optimize your strategies for maximum impact.",
      icon: <BarChart className="size-6" />,
    },
    {
      title: "AI-Driven Insights",
      description:
        "Unlock hidden opportunities with AI-driven insights and recommendations. Make smarter strategic decisions.",
      icon: <Brain className="size-6" />,
    },
    {
      title: "Outcome Orchestration",
      description:
        "Orchestrate better outcomes with AI-powered strategic alignment. Drive measurable business results.",
      icon: <Target className="size-6" />,
    },
  ]

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <header
        className={`sticky top-0 z-50 w-full backdrop-blur-lg transition-all duration-300 ${isScrolled ? "bg-background/80 shadow-sm" : "bg-transparent"}`}
      >
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3 font-bold group">
            <MELogo size="lg" priority={true} />
          </div>
          <nav className="hidden md:flex gap-8">
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </Link>
            <Link
              href="#testimonials"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Testimonials
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Pricing
            </Link>
            <Link
              href="#faq"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              FAQ
            </Link>
          </nav>
          <div className="hidden md:flex gap-4 items-center">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
              {mounted && theme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
              <span className="sr-only">Toggle theme</span>
            </Button>

            {user ? (
              <UserAccountDropdown />
            ) : (
              <>
                <Link href="/auth/signin">
                  <Button variant="ghost" className="text-sm font-medium">
                    Sign In
                  </Button>
                </Link>
                {getStartedAction()}
              </>
            )}
          </div>
          <div className="flex items-center gap-4 md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
              {mounted && theme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-16 inset-x-0 bg-background/95 backdrop-blur-lg border-b"
          >
            <div className="container py-4 flex flex-col gap-4">
              <Link href="#features" className="py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                Features
              </Link>
              <Link href="#testimonials" className="py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                Testimonials
              </Link>
              <Link href="#pricing" className="py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                Pricing
              </Link>
              <Link href="#faq" className="py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                FAQ
              </Link>
              <div className="flex flex-col gap-2 pt-2 border-t">
                {user ? (
                  <UserAccountDropdown />
                ) : (
                  <>
                    <Link href="/auth/signin">
                      <Button variant="ghost" onClick={() => setMobileMenuOpen(false)} className="justify-start">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth/signup">
                      <Button onClick={() => setMobileMenuOpen(false)} className="rounded-full">
                        Get Started
                        <ChevronRight className="ml-1 size-4" />
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </header>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 lg:py-40 overflow-hidden">
          <div className="container px-4 md:px-6 relative">
            <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto mb-12"
            >
              <Badge className="mb-4 rounded-full px-4 py-1.5 text-sm font-medium" variant="secondary">
                The Intelligence Behind Outcomes
              </Badge>
              <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-me-600 to-foreground/70">
                Always 5 Steps Ahead with M/AI
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Advanced AI system specialized in Outcome Orchestration through high-level strategic thinking. Get an
                unfair advantage with machine logic that drives measurable results.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {getStartedAction()}
                {user ? (
                  <Link href="/dashboard">
                    <Button size="lg" variant="outline" className="rounded-full h-12 px-8 text-base">
                      View Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link href="/auth/signin">
                    <Button size="lg" variant="outline" className="rounded-full h-12 px-8 text-base">
                      Start Strategic Session
                    </Button>
                  </Link>
                )}
              </div>
              <div className="flex items-center justify-center gap-4 mt-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Check className="size-4 text-primary" />
                  <span>No setup required</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="size-4 text-primary" />
                  <span>Instant access</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="size-4 text-primary" />
                  <span>Strategic intelligence</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative mx-auto max-w-5xl"
            >
              <div className="rounded-xl overflow-hidden shadow-2xl">
                <AnimatedDashboard />
              </div>
              <div className="absolute -bottom-6 -right-6 -z-10 h-[300px] w-[300px] rounded-full bg-gradient-to-br from-me-500/30 to-me-600/30 blur-3xl opacity-70"></div>
              <div className="absolute -top-6 -left-6 -z-10 h-[300px] w-[300px] rounded-full bg-gradient-to-br from-me-600/30 to-me-500/30 blur-3xl opacity-70"></div>
            </motion.div>
          </div>
        </section>

        {/* Logos Section */}
        <section className="w-full py-12 border-y bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <p className="text-sm font-medium text-muted-foreground">Trusted by strategic leaders worldwide</p>
              <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-16">
                <CompanyLogo name="Microsoft" width={140} height={60} priority={true} />
                <CompanyLogo name="Google" width={120} height={60} />
                <CompanyLogo name="Amazon" width={130} height={60} />
                <CompanyLogo name="Salesforce" width={150} height={60} />
                <CompanyLogo name="Adobe" width={110} height={60} />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-20 md:py-32">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
            >
              <Badge className="rounded-full px-4 py-1.5 text-sm font-medium" variant="secondary">
                Core Capabilities
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Strategic Intelligence at Scale</h2>
              <p className="max-w-[800px] text-muted-foreground md:text-lg">
                Our advanced AI system provides comprehensive strategic capabilities to orchestrate better outcomes and
                drive measurable business results.
              </p>
            </motion.div>

            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {features.map((feature) => (
                <motion.div key={feature.title} variants={item}>
                  <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur transition-all hover:shadow-md">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="size-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary mb-4">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="w-full py-20 md:py-32 bg-muted/30 relative overflow-hidden">
          <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_40%,transparent_100%)]"></div>

          <div className="container px-4 md:px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
            >
              <Badge className="rounded-full px-4 py-1.5 text-sm font-medium" variant="secondary">
                Strategic Process
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">From Challenge to Outcome</h2>
              <p className="max-w-[800px] text-muted-foreground md:text-lg">
                Experience the power of strategic AI orchestration in three simple steps.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative">
              <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -translate-y-1/2 z-0"></div>

              {[
                {
                  step: "01",
                  title: "Define Objective",
                  description:
                    "Describe your strategic challenge or objective. ME analyzes and understands your context.",
                },
                {
                  step: "02",
                  title: "Strategic Analysis",
                  description:
                    "Advanced AI processes your challenge through strategic frameworks and competitive intelligence.",
                },
                {
                  step: "03",
                  title: "Orchestrate Outcomes",
                  description:
                    "Receive actionable strategic roadmaps with clear implementation steps and success metrics.",
                },
              ].map((step) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: Number.parseInt(step.step) * 0.1 }}
                  className="relative z-10 flex flex-col items-center text-center space-y-4"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-me-500 to-me-600 text-white text-xl font-bold shadow-lg">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="w-full py-20 md:py-32">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
            >
              <Badge className="rounded-full px-4 py-1.5 text-sm font-medium" variant="secondary">
                Strategic Success
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Trusted by Strategic Leaders</h2>
              <p className="max-w-[800px] text-muted-foreground md:text-lg">
                See how ME has transformed strategic decision-making for organizations worldwide.
              </p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  quote:
                    "ME has revolutionized our strategic planning process. The AI-driven insights have helped us identify market opportunities we never would have seen.",
                  author: "Sarah Chen",
                  role: "Chief Strategy Officer, TechVentures",
                  rating: 5,
                },
                {
                  quote:
                    "The outcome orchestration capabilities are incredible. We've reduced our strategic planning cycle from months to weeks while improving quality.",
                  author: "Michael Rodriguez",
                  role: "CEO, ScaleUp Dynamics",
                  rating: 5,
                },
                {
                  quote:
                    "ME's competitive intelligence and risk assessment features have given us a significant advantage in market positioning and strategic decisions.",
                  author: "Emily Watson",
                  role: "VP Strategy, GlobalCorp",
                  rating: 5,
                },
                {
                  quote:
                    "The strategic templates and frameworks have accelerated our decision-making process. It's like having a strategic consultant available 24/7.",
                  author: "David Kim",
                  role: "Managing Director, InnovateFirst",
                  rating: 5,
                },
                {
                  quote:
                    "Implementation was seamless, and the ROI was immediate. Our strategic initiatives now have clear metrics and measurable outcomes.",
                  author: "Lisa Patel",
                  role: "Chief Operating Officer, FutureScale",
                  rating: 5,
                },
                {
                  quote:
                    "ME has transformed how we approach complex business challenges. The strategic analysis depth is unmatched by any other platform.",
                  author: "James Wilson",
                  role: "Executive Director, StrategicEdge",
                  rating: 5,
                },
              ].map((testimonial) => (
                <motion.div
                  key={testimonial.author}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.05 }}
                >
                  <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur transition-all hover:shadow-md">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex mb-4">
                        {Array(testimonial.rating)
                          .fill(0)
                          .map((_, j) => (
                            <Star key={j} className="size-4 text-yellow-500 fill-yellow-500" />
                          ))}
                      </div>
                      <p className="text-lg mb-6 flex-grow">{testimonial.quote}</p>
                      <div className="flex items-center gap-4 mt-auto pt-4 border-t border-border/40">
                        <div className="size-10 rounded-full bg-muted flex items-center justify-center text-foreground font-medium">
                          {testimonial.author.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{testimonial.author}</p>
                          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="w-full py-20 md:py-32 bg-muted/30 relative overflow-hidden">
          <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_40%,transparent_100%)]"></div>

          <div className="container px-4 md:px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
            >
              <Badge className="rounded-full px-4 py-1.5 text-sm font-medium" variant="secondary">
                Strategic Access
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Choose Your Strategic Advantage</h2>
              <p className="max-w-[800px] text-muted-foreground md:text-lg">
                Select the plan that matches your strategic needs and organizational scale.
              </p>
            </motion.div>

            <div className="mx-auto max-w-5xl">
              <Tabs defaultValue="monthly" className="w-full">
                <div className="flex justify-center mb-8">
                  <TabsList className="rounded-full p-1">
                    <TabsTrigger value="monthly" className="rounded-full px-6">
                      Monthly
                    </TabsTrigger>
                    <TabsTrigger value="annually" className="rounded-full px-6">
                      Annually (Save 20%)
                    </TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="monthly">
                  <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
                    {[
                      {
                        name: "Strategic",
                        price: "$99",
                        description: "Perfect for individual strategists and small teams.",
                        features: ["Strategic templates", "Basic analytics", "5 operations", "Email support"],
                        cta: "Access ME Platform",
                      },
                      {
                        name: "Professional",
                        price: "$299",
                        description: "Ideal for growing organizations.",
                        features: [
                          "Advanced strategic analysis",
                          "Competitive intelligence",
                          "25 operations",
                          "Priority support",
                          "API access",
                        ],
                        cta: "Access ME Platform",
                        popular: true,
                      },
                      {
                        name: "Enterprise",
                        price: "$999",
                        description: "For large organizations with complex strategic needs.",
                        features: [
                          "Unlimited operations",
                          "Custom strategic frameworks",
                          "Dedicated success manager",
                          "24/7 strategic support",
                          "Advanced integrations",
                          "Custom training",
                        ],
                        cta: "Contact Strategic Team",
                      },
                    ].map((plan) => (
                      <motion.div
                        key={`monthly-${plan.name}`}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                      >
                        <Card
                          className={`relative overflow-hidden h-full ${plan.popular ? "border-primary shadow-lg" : "border-border/40 shadow-md"} bg-gradient-to-b from-background to-muted/10 backdrop-blur`}
                        >
                          {plan.popular && (
                            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-bl-lg">
                              Most Popular
                            </div>
                          )}
                          <CardContent className="p-6 flex flex-col h-full">
                            <h3 className="text-2xl font-bold">{plan.name}</h3>
                            <div className="flex items-baseline mt-4">
                              <span className="text-4xl font-bold">{plan.price}</span>
                              <span className="text-muted-foreground ml-1">/month</span>
                            </div>
                            <p className="text-muted-foreground mt-2">{plan.description}</p>
                            <ul className="space-y-3 my-6 flex-grow">
                              {plan.features.map((feature) => (
                                <li key={feature} className="flex items-center">
                                  <Check className="mr-2 size-4 text-primary" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                            <Link href="/chat">
                              <Button
                                className={`w-full mt-auto rounded-full ${plan.popular ? "bg-primary hover:bg-primary/90" : "bg-muted hover:bg-muted/80"}`}
                                variant={plan.popular ? "default" : "outline"}
                              >
                                {plan.cta}
                              </Button>
                            </Link>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="annually">
                  <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
                    {[
                      {
                        name: "Strategic",
                        price: "$79",
                        description: "Perfect for individual strategists and small teams.",
                        features: ["Strategic templates", "Basic analytics", "5 operations", "Email support"],
                        cta: "Access ME Platform",
                      },
                      {
                        name: "Professional",
                        price: "$239",
                        description: "Ideal for growing organizations.",
                        features: [
                          "Advanced strategic analysis",
                          "Competitive intelligence",
                          "25 operations",
                          "Priority support",
                          "API access",
                        ],
                        cta: "Access ME Platform",
                        popular: true,
                      },
                      {
                        name: "Enterprise",
                        price: "$799",
                        description: "For large organizations with complex strategic needs.",
                        features: [
                          "Unlimited operations",
                          "Custom strategic frameworks",
                          "Dedicated success manager",
                          "24/7 strategic support",
                          "Advanced integrations",
                          "Custom training",
                        ],
                        cta: "Contact Strategic Team",
                      },
                    ].map((plan) => (
                      <motion.div
                        key={`annually-${plan.name}`}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                      >
                        <Card
                          className={`relative overflow-hidden h-full ${plan.popular ? "border-primary shadow-lg" : "border-border/40 shadow-md"} bg-gradient-to-b from-background to-muted/10 backdrop-blur`}
                        >
                          {plan.popular && (
                            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-bl-lg">
                              Most Popular
                            </div>
                          )}
                          <CardContent className="p-6 flex flex-col h-full">
                            <h3 className="text-2xl font-bold">{plan.name}</h3>
                            <div className="flex items-baseline mt-4">
                              <span className="text-4xl font-bold">{plan.price}</span>
                              <span className="text-muted-foreground ml-1">/month</span>
                            </div>
                            <p className="text-muted-foreground mt-2">{plan.description}</p>
                            <ul className="space-y-3 my-6 flex-grow">
                              {plan.features.map((feature) => (
                                <li key={feature} className="flex items-center">
                                  <Check className="mr-2 size-4 text-primary" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                            <Link href="/chat">
                              <Button
                                className={`w-full mt-auto rounded-full ${plan.popular ? "bg-primary hover:bg-primary/90" : "bg-muted hover:bg-muted/80"}`}
                                variant={plan.popular ? "default" : "outline"}
                              >
                                {plan.cta}
                              </Button>
                            </Link>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="w-full py-20 md:py-32">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
            >
              <Badge className="rounded-full px-4 py-1.5 text-sm font-medium" variant="secondary">
                FAQ
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Frequently Asked Questions</h2>
              <p className="max-w-[800px] text-muted-foreground md:text-lg">
                Find answers to common questions about ME and strategic outcome orchestration.
              </p>
            </motion.div>

            <div className="mx-auto max-w-3xl">
              <Accordion type="single" collapsible className="w-full">
                {[
                  {
                    question: "What makes ME different from other strategic planning tools?",
                    answer:
                      "ME is an advanced AI system specifically designed for outcome orchestration through strategic thinking. Unlike traditional tools, ME provides real-time strategic analysis, competitive intelligence, and actionable roadmaps with measurable KPIs.",
                  },
                  {
                    question: "How quickly can I see results from using ME?",
                    answer:
                      "Most users see immediate value from their first strategic session. ME provides instant strategic analysis and recommendations. For complex operations, you'll typically see measurable outcomes within 2-4 weeks of implementation.",
                  },
                  {
                    question: "Can ME handle industry-specific strategic challenges?",
                    answer:
                      "Yes, ME's advanced AI is trained on diverse strategic frameworks and can adapt to any industry. The system analyzes your specific context, market dynamics, and competitive landscape to provide tailored strategic recommendations.",
                  },
                  {
                    question: "Is my strategic data secure with ME?",
                    answer:
                      "Absolutely. ME uses enterprise-grade security with end-to-end encryption. All strategic data is protected with military-grade security protocols, and we maintain strict compliance with international data protection regulations.",
                  },
                  {
                    question: "How does the Operations Dashboard work?",
                    answer:
                      "The Operations Dashboard allows you to manage multiple strategic initiatives simultaneously. You can track progress, monitor KPIs, manage milestones, and get real-time insights on all your strategic operations from a single interface.",
                  },
                  {
                    question: "What kind of support is available?",
                    answer:
                      "Support varies by plan. All plans include access to our knowledge base and strategic templates. Professional plans include priority email support, while Enterprise plans include dedicated strategic success managers and 24/7 support.",
                  },
                ].map((faq) => (
                  <motion.div
                    key={faq.question}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                  >
                    <AccordionItem value={faq.question} className="border-b border-border/40 py-2">
                      <AccordionTrigger className="text-left font-medium hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-20 md:py-32 relative overflow-hidden">
          {/* Multi-layered gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-me-500 via-primary to-me-600"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-me-400/20 to-primary/40"></div>
          <div className="absolute inset-0 bg-gradient-to-bl from-me-600/30 via-transparent to-me-500/20"></div>

          {/* Animated gradient orbs */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-br from-me-400/40 to-primary/30 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute -bottom-24 -right-24 w-96 h-96 bg-gradient-to-tl from-primary/40 to-me-600/30 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-me-300/20 to-primary/20 rounded-full blur-2xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

          {/* Noise texture overlay */}
          <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>

          <div className="container px-4 md:px-6 relative text-primary-foreground">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center space-y-6 text-center"
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                Ready to Orchestrate Better Outcomes?
              </h2>
              <p className="mx-auto max-w-[700px] text-primary-foreground/80 md:text-xl">
                Join strategic leaders who have transformed their decision-making with ME's advanced AI-powered outcome
                orchestration platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                {user ? (
                  <>
                    <Link href="/chat">
                      <Button size="lg" variant="secondary" className="rounded-full h-12 px-8 text-base">
                        Access ME Platform
                        <ArrowRight className="ml-2 size-4" />
                      </Button>
                    </Link>
                    <Link href="/dashboard">
                      <Button
                        size="lg"
                        variant="outline"
                        className="rounded-full h-12 px-8 text-base bg-transparent border-white text-white hover:bg-white/10"
                      >
                        View Dashboard
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/auth/signup">
                      <Button size="lg" variant="secondary" className="rounded-full h-12 px-8 text-base">
                        Get Started Now
                        <ArrowRight className="ml-2 size-4" />
                      </Button>
                    </Link>
                    <Link href="/auth/signin">
                      <Button
                        size="lg"
                        variant="outline"
                        className="rounded-full h-12 px-8 text-base bg-transparent border-white text-white hover:bg-white/10"
                      >
                        Start Strategic Session
                      </Button>
                    </Link>
                  </>
                )}
              </div>
              <p className="text-sm text-primary-foreground/80 mt-4">
                No setup required. Instant access. Strategic intelligence at your fingertips.
              </p>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer remains the same... */}
      <footer className="w-full border-t bg-background/95 backdrop-blur-sm">
        <div className="container flex flex-col gap-8 px-4 py-10 md:px-6 lg:py-16">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3 font-bold">
                <MELogo size="md" />
              </div>
              <p className="text-sm text-muted-foreground">
                The Intelligence Behind Outcomes. Advanced AI system for strategic outcome orchestration.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row justify-between items-center border-t border-border/40 pt-8">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} SaaSify. The Intelligence Behind Outcomes. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
