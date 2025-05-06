import { Permission, FlatPermission , AppPermissions } from "./types";

export const getFlatPermissions = (permissionsTab: AppPermissions) => {
    return Object.entries(permissionsTab).flatMap(([entity, actions]) =>
      Object.entries(actions)
        .filter(([action]) => {
          if (['historique_Paiement', 'historique_Depenses'].includes(entity)) {
            return !['creer', 'modifier', 'supprimer'].includes(action);
          }
          if (entity === 'paiement') {
            return !['creer', 'supprimer'].includes(action);
          }
          return true;
        })
        .map(([action, permission]) => ({
          id: `${entity}_${action}`,
          name: `${action} ${entity}`,
          description: permission.description,
          entity,
        }))
    );
  };
  