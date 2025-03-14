// https://ui.mantine.dev/component/hero-image-right/

import { Button, Container, Text, Title } from '@mantine/core';
import classes from './HeroSection.module.css';
import { motion } from 'framer-motion';

export function HeroSection() {
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
                CDRI Data Hub
              </Title>

              <Text className={classes.description} mt={30}>
              Empowering Evidence-Based Decision-Making
              </Text>
            </motion.section>
          </div>
        </div>
      </Container>
    </div>
  );
}