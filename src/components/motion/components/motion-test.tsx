'use client'

import { Card, CardContent } from '@/components/ui'
import { motion } from 'framer-motion'

export function MotionTest() {
  return (
    <div className="relative">
      <motion.div
        className="absolute inset-0 rounded-card z-0 overflow-hidden blur-md"
        animate={{
          boxShadow: [
            '0 0 15px 5px rgba(57, 255, 20, 0.1)',
            '0 0 25px 10px rgba(57, 255, 20, 0.2)',
            '0 0 15px 5px rgba(57, 255, 20, 0.1)',
          ],
          backgroundColor: [
            'rgba(57, 255, 20, 0.05)',
            'rgba(57, 255, 20, 0.03)',
            'rgba(57, 255, 20, 0.05)',
          ],
        }}
        transition={{
          duration: 3,
          ease: 'easeInOut',
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      />

      <Card className="border-primary/50">
        <CardContent>
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Nulla, alias
          aperiam neque, tempora tenetur eligendi ipsum nobis cupiditate cum
          necessitatibus id officiis? Beatae omnis esse nihil ducimus? Quas,
          harum debitis.
        </CardContent>
      </Card>
    </div>
  )
}
