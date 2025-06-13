"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BarChart3, TrendingUp, Users, Target, Brain, Zap, ArrowUpRight, Activity, Globe, Shield } from "lucide-react"

export function AnimatedDashboard() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  }

  const floatingVariants = {
    animate: {
      y: [-5, 5, -5],
      transition: {
        duration: 3,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      },
    },
  }

  const pulseVariants = {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      },
    },
  }

  return (
    <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[600px] bg-gradient-to-br from-background via-muted/20 to-background rounded-xl overflow-hidden border border-border/40">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] sm:bg-[size:2rem_2rem] opacity-30" />

      {/* Floating Orbs - Adjusted for mobile */}
      <motion.div
        variants={floatingVariants}
        animate="animate"
        className="absolute top-10 left-10 sm:top-20 sm:left-20 w-16 h-16 sm:w-32 sm:h-32 bg-gradient-to-br from-me-500/20 to-me-600/20 rounded-full blur-xl"
      />
      <motion.div
        variants={floatingVariants}
        animate="animate"
        style={{ animationDelay: "1s" }}
        className="absolute bottom-10 right-10 sm:bottom-20 sm:right-20 w-12 h-12 sm:w-24 sm:h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-xl"
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 p-3 sm:p-4 lg:p-6 h-full"
      >
        {/* Header - Mobile Optimized */}
        <motion.div variants={itemVariants} className="flex items-center justify-between mb-3 sm:mb-4 lg:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-me-500 to-me-600 rounded-lg flex items-center justify-center">
              <Brain className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm sm:text-base lg:text-lg">ME Operations Center</h3>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                Strategic Intelligence Dashboard
              </p>
            </div>
          </div>
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs"
          >
            <Activity className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
            Live
          </Badge>
        </motion.div>

        {/* Mobile Layout - Stacked */}
        <div className="block sm:hidden space-y-3">
          {/* Mobile Metrics Row */}
          <motion.div variants={itemVariants} className="grid grid-cols-3 gap-2">
            <Card className="bg-gradient-to-br from-background to-muted/10 border-border/40">
              <CardContent className="p-2">
                <div className="flex items-center justify-center mb-1">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">247</div>
                  <div className="text-xs text-muted-foreground">Operations</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-background to-muted/10 border-border/40">
              <CardContent className="p-2">
                <div className="flex items-center justify-center mb-1">
                  <Target className="w-3 h-3 text-me-500" />
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">94%</div>
                  <div className="text-xs text-muted-foreground">Success</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-background to-muted/10 border-border/40">
              <CardContent className="p-2">
                <div className="flex items-center justify-center mb-1">
                  <Users className="w-3 h-3 text-blue-500" />
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">1.8K</div>
                  <div className="text-xs text-muted-foreground">Users</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Mobile Chart */}
          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-br from-background to-muted/10 border-border/40">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-sm">Outcome Orchestration</h4>
                  <BarChart3 className="w-3 h-3 text-muted-foreground" />
                </div>

                {/* Mobile Chart Bars */}
                <div className="flex items-end justify-between h-24 px-1">
                  {[65, 78, 52, 85, 92, 67, 88, 95].map((height, index) => (
                    <motion.div
                      key={index}
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{
                        duration: 1,
                        delay: index * 0.1,
                        ease: "easeOut",
                      }}
                      className="w-3 bg-gradient-to-t from-me-500 to-me-600 rounded-t-sm"
                    />
                  ))}
                </div>

                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  {["M", "T", "W", "T", "F", "S", "S", "Now"].map((day) => (
                    <span key={day}>{day}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Mobile Status Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-2">
            <Card className="bg-gradient-to-br from-background to-muted/10 border-border/40">
              <CardContent className="p-2">
                <div className="flex items-center gap-1 mb-1">
                  <Globe className="w-3 h-3 text-me-500" />
                  <span className="text-xs font-medium">Global</span>
                </div>
                <div className="text-sm font-bold">127 Countries</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-background to-muted/10 border-border/40">
              <CardContent className="p-2">
                <div className="flex items-center gap-1 mb-1">
                  <Shield className="w-3 h-3 text-green-500" />
                  <span className="text-xs font-medium">Security</span>
                </div>
                <div className="text-sm font-bold text-green-600">99.9%</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Tablet Layout - 2 Column */}
        <div className="hidden sm:block lg:hidden">
          <div className="grid grid-cols-2 gap-3 h-[calc(100%-60px)]">
            {/* Left Column - Metrics */}
            <div className="space-y-3">
              <motion.div variants={itemVariants}>
                <Card className="bg-gradient-to-br from-background to-muted/10 border-border/40">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground">Strategic Operations</span>
                      <TrendingUp className="w-3 h-3 text-green-500" />
                    </div>
                    <div className="text-xl font-bold">247</div>
                    <div className="text-xs text-green-600">+12% from last month</div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="bg-gradient-to-br from-background to-muted/10 border-border/40">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground">Success Rate</span>
                      <Target className="w-3 h-3 text-me-500" />
                    </div>
                    <div className="text-xl font-bold">94.2%</div>
                    <Progress value={94.2} className="mt-2 h-1.5" />
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="bg-gradient-to-br from-background to-muted/10 border-border/40">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground">Active Users</span>
                      <Users className="w-3 h-3 text-blue-500" />
                    </div>
                    <div className="text-xl font-bold">1,847</div>
                    <div className="text-xs text-blue-600">+5.2% this week</div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Right Column - Chart & Status */}
            <div className="space-y-3">
              <motion.div variants={itemVariants} className="flex-1">
                <Card className="h-48 bg-gradient-to-br from-background to-muted/10 border-border/40">
                  <CardContent className="p-3 h-full">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-sm">Outcome Orchestration</h4>
                      <BarChart3 className="w-3 h-3 text-muted-foreground" />
                    </div>

                    {/* Tablet Chart Bars */}
                    <div className="flex items-end justify-between h-32 px-1">
                      {[65, 78, 52, 85, 92, 67, 88, 95].map((height, index) => (
                        <motion.div
                          key={index}
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{
                            duration: 1,
                            delay: index * 0.1,
                            ease: "easeOut",
                          }}
                          className="w-4 bg-gradient-to-t from-me-500 to-me-600 rounded-t-sm"
                        />
                      ))}
                    </div>

                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Now"].map((day) => (
                        <span key={day} className="text-xs">
                          {day.slice(0, 1)}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants} className="grid grid-cols-2 gap-2">
                <Card className="bg-gradient-to-br from-background to-muted/10 border-border/40">
                  <CardContent className="p-2">
                    <div className="flex items-center gap-1 mb-1">
                      <Globe className="w-3 h-3 text-me-500" />
                      <span className="text-xs font-medium">Global</span>
                    </div>
                    <div className="text-sm font-bold">127</div>
                    <div className="text-xs text-muted-foreground">Countries</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-background to-muted/10 border-border/40">
                  <CardContent className="p-2">
                    <div className="flex items-center gap-1 mb-1">
                      <Zap className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs font-medium">AI</span>
                    </div>
                    <motion.div
                      variants={pulseVariants}
                      animate="animate"
                      className="text-sm font-bold text-yellow-600"
                    >
                      Live
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Desktop Layout - 3 Column (Original) */}
        <div className="hidden lg:grid lg:grid-cols-12 lg:gap-4 lg:h-[calc(100%-100px)]">
          {/* Left Column - Metrics */}
          <div className="col-span-4 space-y-4">
            <motion.div variants={itemVariants}>
              <Card className="bg-gradient-to-br from-background to-muted/10 border-border/40">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Strategic Operations</span>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold">247</div>
                  <div className="text-xs text-green-600">+12% from last month</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="bg-gradient-to-br from-background to-muted/10 border-border/40">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Success Rate</span>
                    <Target className="w-4 h-4 text-me-500" />
                  </div>
                  <div className="text-2xl font-bold">94.2%</div>
                  <Progress value={94.2} className="mt-2 h-2" />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="bg-gradient-to-br from-background to-muted/10 border-border/40">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Active Users</span>
                    <Users className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold">1,847</div>
                  <div className="text-xs text-blue-600">+5.2% this week</div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Center Column - Chart */}
          <div className="col-span-5">
            <motion.div variants={itemVariants} className="h-full">
              <Card className="h-full bg-gradient-to-br from-background to-muted/10 border-border/40">
                <CardContent className="p-4 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">Outcome Orchestration</h4>
                    <BarChart3 className="w-4 h-4 text-muted-foreground" />
                  </div>

                  {/* Desktop Chart Bars */}
                  <div className="flex items-end justify-between h-48 px-2">
                    {[65, 78, 52, 85, 92, 67, 88, 95].map((height, index) => (
                      <motion.div
                        key={index}
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{
                          duration: 1,
                          delay: index * 0.1,
                          ease: "easeOut",
                        }}
                        className="w-6 bg-gradient-to-t from-me-500 to-me-600 rounded-t-sm"
                      />
                    ))}
                  </div>

                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Today"].map((day) => (
                      <span key={day}>{day}</span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Actions */}
          <div className="col-span-3 space-y-4">
            <motion.div variants={itemVariants}>
              <Card className="bg-gradient-to-br from-background to-muted/10 border-border/40">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="w-4 h-4 text-me-500" />
                    <span className="text-sm font-medium">Global Reach</span>
                  </div>
                  <div className="text-lg font-bold">127 Countries</div>
                  <Button size="sm" variant="outline" className="w-full mt-2">
                    View Map
                    <ArrowUpRight className="w-3 h-3 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="bg-gradient-to-br from-background to-muted/10 border-border/40">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">Security</span>
                  </div>
                  <div className="text-lg font-bold text-green-600">99.9% Uptime</div>
                  <div className="text-xs text-muted-foreground">Enterprise Grade</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="bg-gradient-to-br from-background to-muted/10 border-border/40">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">AI Processing</span>
                  </div>
                  <motion.div variants={pulseVariants} animate="animate" className="text-lg font-bold text-yellow-600">
                    Real-time
                  </motion.div>
                  <div className="text-xs text-muted-foreground">Neural Networks Active</div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
