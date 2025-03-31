import { Button, Container, Text, Title } from '@mantine/core';
import classes from './HeroSection.module.css';
import { motion } from 'framer-motion';

interface HeroSectionProps {
  title: string;
  subtitle: string;
}

export function HeroSection({ title, subtitle }: HeroSectionProps) {
  return (
    <div className={classes.root}>
      <Container size="lg">
        <div className={classes.inner}>
          <div className={classes.content}>
            <motion.section
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Title className={classes.title}>
                {title}
              </Title>

              <Text className={classes.description} mt={30}>
                {subtitle}
              </Text>
            </motion.section>
          </div>
        </div>
      </Container>
    </div>
  );
}
