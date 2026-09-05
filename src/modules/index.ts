import { ModuleStrategy } from '../types/generation';
import { VectorModule } from './vector';
import { LogoModule } from './logo';
import { TypographyModule } from './typography';

export const getModule = (tab: string): ModuleStrategy => {
  switch (tab) {
    case 'vectorize':
      return VectorModule;
    case 'logo design':
      return LogoModule;
    case 'typography':
      return TypographyModule;
    default:
      return VectorModule;
  }
};
