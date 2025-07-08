// import {User , Role, Permission} from "@/lib/interface";
  
//   type RawUser = Omit<User, "permissions">;
  
//   // Fonction de fusion
//   export function mergeUserData(
//     inputUser: RawUser | RawUser[],
//     allRoles: Role[],
//     allPermissions: Permission[]
//   ): User | User[] {
//     const processUser = (user: RawUser): User => {
//       const userRoles: Role[] = user.roles.map(userRole => {
//         const fullRole = allRoles.find(r => r.id === userRole.id);
//         return {
//           ...userRole,
//           permissions: fullRole?.permissions || []
//         };
//       });
  
//       // Fusionner les permissions uniques
//       const userPermissions: Permission[] = [];
//       const seenPermissions = new Set<number>();
  
//       userRoles.forEach(role => {
//         role.permissions?.forEach(permission => {
//           if (!seenPermissions.has(permission.id)) {
//             seenPermissions.add(permission.id);
//             userPermissions.push(permission);
//           }
//         });
//       });
  
//       return {
//         ...user,
//         roles: userRoles,
//         permissions: userPermissions
//       };
//     };
  
//     return Array.isArray(inputUser)
//       ? inputUser.map(processUser)
//       : processUser(inputUser);
//   }
  