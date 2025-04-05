import { Metadata } from 'next';
import CompositionCreationGuide from '../composition-creation';

export const metadata: Metadata = {
  title: 'Creating Compositions | MoveMatrix Guide',
  description: 'Learn how to create a Leveraged Yield Farming composition in MoveMatrix, including validation and deployment.',
};

export default function CompositionGuidePage() {
  return <CompositionCreationGuide />;
} 