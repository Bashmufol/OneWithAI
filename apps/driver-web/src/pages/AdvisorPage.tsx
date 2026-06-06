import { motion } from "framer-motion"

import { ChargeAdvisor } from "@/components/ai/ChargeAdvisor"
import { PageSection } from "@/components/ev/PageSection"
import { slideUp } from "@/lib/motion"

export function AdvisorPage() {
  return (
    <PageSection
      title="AI Advisor"
      description="Conversational charging assistant powered by EvoScore — get personalized station recommendations in seconds."
      badge="Feature 6"
      badgeVariant="outline"
    >
      <motion.div variants={slideUp} className="md:col-span-2 lg:col-span-3">
        <ChargeAdvisor />
      </motion.div>
    </PageSection>
  )
}
