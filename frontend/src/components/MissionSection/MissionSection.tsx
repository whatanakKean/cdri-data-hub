// https://ui.mantine.dev/category/features/


import { IconCookie, IconGauge, IconUser } from '@tabler/icons-react';
import {
  Badge,
  Card,
  Container,
  Group,
  SimpleGrid,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core';
import classes from './MissionSection.module.css';
import { motion } from 'framer-motion';

const mockdata = [
  {
    title: 'Insight',
    description:
      'Provide accessible, high-quality knowledge and insights on various sectors in Cambodia.',
    icon: IconGauge,
  },
  {
    title: 'Interactive Tools',
    description:
      'Support decision-making through easy-to-use data visualization tools.',
    icon: IconUser,
  },
  {
    title: 'Collaboration',
    description:
      'Foster collaboration among researchers, policymakers, and private sector.',
    icon: IconCookie,
  },
];

export function MissionSection() {
  const theme = useMantineTheme();
  const features = mockdata.map((feature) => (
    <Card key={feature.title} shadow="md" radius="md" className={classes.card} padding="xl">
      <feature.icon size={50} stroke={2} color={theme.colors.blue[6]} />
      <Text fz="lg" fw={500} className={classes.cardTitle} mt="md">
        {feature.title}
      </Text>
      <Text fz="sm" c="dimmed" mt="sm">
        {feature.description}
      </Text>
    </Card>
  ));

  return (
    <Container size="lg" py="xl">
      <Group justify="center">
        <Badge variant="filled" size="lg">
          Best company ever
        </Badge>
      </Group>

      <Title order={2} className={classes.title} ta="center" mt="sm">
        Integrate effortlessly with any technology stack
      </Title>

      <Text className={classes.description} ta="center" mt="md">
        CDRI Data Hub is a centralized repository for research data, offering reliable knowledge and insights across various sectors in Cambodia. It supports evidence-based decision-making by providing datasets, visualization tools, and knowledge tailored to researchers, policymakers, and private sector.
      </Text>

        <motion.section
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
        >
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl" mt={50}>
                {features}
            </SimpleGrid>
        </motion.section>
    </Container>
  );
}