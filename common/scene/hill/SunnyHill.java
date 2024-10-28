class SunnyHill extends RemoteObject{
    public static final CommandBuffer COMMAND_BUFFER = new CommandBuffer();

    public SunnyHill(String[] args){
        super("Hill");
        SunnyHill.COMMAND_BUFFER.addNewObject(this);
    }   

    protected void addAttributes(JsonObject json){
        
    } 

    protected void addTree(Tree tree){
        SunnyHill.COMMAND_BUFFER.addCommand("addTree", this, new JsonObject().put("tree", tree.toJsonReference()));
    }
}
