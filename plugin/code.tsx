figma.showUI(__html__, { width: 1000, height: 700, themeColors: true });

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'create-variables') {
    const { colors } = msg.payload;
    const localCollections = await figma.variables.getLocalVariableCollectionsAsync();
    let collection = localCollections.find(c => c.name === "Soloist Primitives");
    
    if (!collection) collection = figma.variables.createVariableCollection("Soloist Primitives");

    let count = 0;
    for (const color of colors) {
      const vars = await figma.variables.getLocalVariablesAsync();
      let variable = vars.find(v => v.name === color.name && v.variableCollectionId === collection?.id);
      
      if (!variable) variable = figma.variables.createVariable(color.name, collection.id, "COLOR");
      
      const rgb = hexToRgb(color.hex);
      variable.setValueForMode(collection.defaultModeId, rgb);
      count++;
    }
    figma.notify(`Synced ${count} variables.`);
  }
};

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? { r: parseInt(result[1], 16) / 255, g: parseInt(result[2], 16) / 255, b: parseInt(result[3], 16) / 255 } : { r:0, g:0, b:0 };
}