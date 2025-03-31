import { Button, Container, Text, Title } from '@mantine/core';
import classes from './HeroSection.module.css';
import { motion } from 'framer-motion';
import { Autocomplete, Loader } from '@mantine/core';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook

interface HeroSectionProps {
  title: string;
  subtitle: string;
}

const combinedOptions = [
  'Rice Production',
  'Rice Export'
];

// Function to transform strings like 'Rice Production' into 'rice-production'
const formatToSlug = (str: string) => {
  return str
    .toLowerCase()                  // Convert to lowercase
    .replace(/\s+/g, '-')            // Replace spaces with dashes
    .replace(/[^\w\-]+/g, '');       // Remove non-word characters (except dashes)
};

export function DataExplorerHeroSection({ title, subtitle }: HeroSectionProps) {
  const navigate = useNavigate(); // Initialize useNavigate

  // Function to handle the redirection
  const handleSelect = (value: string) => {
    const slug = formatToSlug(value); // Format the selected value into a slug
    navigate(`/${slug}`);             // Navigate to the URL with the slug
  };

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

              <Autocomplete
                placeholder="Ask anything..."
                data={combinedOptions}
                limit={25}
                onChange={handleSelect} // Handle onChange for the redirect
                styles={{
                  input: { marginBottom: '16px' },
                  dropdown: { maxHeight: 200, overflowY: 'auto' },
                }}
              />
            </motion.section>
          </div>
        </div>
      </Container>
    </div>
  );
}
