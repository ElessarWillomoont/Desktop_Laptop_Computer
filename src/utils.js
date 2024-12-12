export function findObjectByName(parent, name) {
    let result = null;
    parent.traverse((child) => {
      if (child.name === name) result = child;
    });
    return result;
  }
  
  export function applyMaterialToMeshes(parent, rules) {
    parent.traverse((child) => {
      if (child.isMesh) {
        for (const rule of rules) {
          if (rule.names.includes(child.name)) {
            child.material = rule.material;
          }
        }
      }
    });
  }
  