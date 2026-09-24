class SunnyHill extends de.fau.tf.lgdv.runtime.RemoteObject{
    public static final de.fau.tf.lgdv.runtime.CommandBuffer COMMAND_BUFFER = new de.fau.tf.lgdv.runtime.CommandBuffer();

    public SunnyHill(String[] args){
        super("Hill");
        SunnyHill.COMMAND_BUFFER.addNewObject(this);
    }   

    protected void addAttributes(de.fau.tf.lgdv.json.JsonObject json){
        
    } 

    protected void addTree(Tree tree){
        SunnyHill.COMMAND_BUFFER.addCommand("addTree", this, new de.fau.tf.lgdv.json.JsonObject().put("tree", tree.toJsonReference()));
    }
}
