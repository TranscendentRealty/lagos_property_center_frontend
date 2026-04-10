export interface ExploreRouteConfig {
  category: string;
  values: string[];
  limit: number;
}

/**
 * Maps URL slugs to explore API parameters.
 * Add new slugs here to create new shareable explore pages.
 */
export const exploreRoutes: Record<string, ExploreRouteConfig> = {
  'available':                      { category: 'status',           values: ['available'],                           limit: 9  },
  'apartment':                      { category: 'propertyType',     values: ['Apartment'],                           limit: 12 },
  'terrace':                        { category: 'propertySubtype',  values: ['Terrace'],                             limit: 12 },
  'semi-detached':                  { category: 'propertySubtype',  values: ['Semi-Detached'],                       limit: 12 },
  'fully-detached':                 { category: 'propertySubtype',  values: ['Fully Detached'],                      limit: 12 },
  'lekki-phase-1-ikate':            { category: 'location.street',  values: ['Lekki Phase 1', 'Ikate'],              limit: 9  },
  'osapa-idado':                    { category: 'location.street',  values: ['Osapa', 'Idado'],                      limit: 9  },
  'chevron-ologolo':                { category: 'location.street',  values: ['Chevron', 'Ologolo'],                  limit: 9  },
  'orchid-lekki-conservation-road': { category: 'location.street',  values: ['Orchid', 'Lekki Conservation Road'],   limit: 9  },
  'ikota-vgc':                      { category: 'location.street',  values: ['Ikota', 'VGC'],                        limit: 9  },
};
