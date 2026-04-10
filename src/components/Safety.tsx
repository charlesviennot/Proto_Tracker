import { motion } from 'motion/react';
import { ShieldCheck, Activity, UserCheck, ZapOff } from 'lucide-react';

const safetyFeatures = [
  {
    icon: ShieldCheck,
    title: "100% Non-Invasive",
    description: "No needles, no surgery, no physical manipulation. The therapy is delivered entirely through acoustic waves."
  },
  {
    icon: ZapOff,
    title: "Zero Pharmacological Load",
    description: "Eliminates the risk of chemical dependencies, drug interactions, or systemic toxicity associated with medications."
  },
  {
    icon: UserCheck,
    title: "High Patient Adherence",
    description: "A relaxing, effortless experience leading to exceptional compliance rates in both clinical and athletic settings."
  },
  {
    icon: Activity,
    title: "Operator Independent",
    description: "Standardized protocols ensure consistent, reproducible results regardless of the practitioner administering the session."
  }
];

export function Safety() {
  return (
    <section id="safety" className="py-24 bg-[#F5F5F7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-semibold text-[#1D1D1F] tracking-tight mb-6">Safety & Compliance</h2>
          <p className="text-xl text-[#86868B]">A risk-free modality designed for seamless integration into any care protocol.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {safetyFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-8 rounded-[2rem] border border-black/5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-[#F5F5F7] rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-black/5">
                <feature.icon className="w-6 h-6 text-[#1D1D1F]" />
              </div>
              <h3 className="text-xl font-semibold text-[#1D1D1F] mb-3">{feature.title}</h3>
              <p className="text-[#424245] text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
