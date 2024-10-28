abstract class RemoteObject implements JsonSerializer {
    private static int NEXT_PLAYER_ID = 1;
    public final String TYPE;
    public final int ID;

    protected RemoteObject(String typeString){
        this.TYPE = typeString;
        this.ID = NEXT_PLAYER_ID++;
    }

    protected abstract void addAttributes(JsonObject json);    

    public JsonObject toJsonReference(){
        return new JsonObject().put("type", TYPE).put("id", ID);
        
    }
    public JsonObject toJsonObject(){
        JsonObject obj =  this.toJsonReference();
        this.addAttributes(obj);
        return obj;
    }

    public String toJson(){
        return toJsonObject().toJson();
    }
}


class CommandBuffer {
    private boolean didSubmit = false;
    protected final java.util.List<String>  commands = new java.util.LinkedList<>();

    public static JsonObject of(RemoteObject obj){
        return obj.toJsonReference();
    }

    public void addEmptyCommand(String command){
        this.addCommand(new JsonObject().put("command", command));
    }

    public void addCommand(String command, int value){
        this.addCommand(new JsonObject()
            .put("command", command)
            .put("value", value)
        );
    }

    public void addCommand(String command, boolean value){
        this.addCommand(new JsonObject()
            .put("command", command)
            .put("value", value)
        );
    }

    public void addCommand(String command, RemoteObject obj){
        this.addCommand(command, obj, new JsonObject());
    }

    public void addCommand(String command, RemoteObject obj, JsonObject data){
        this.addCommand(data
            .put("command", command)
            .put("object", of(obj))
        );
    }

    public void addCommand(String command, JsonObject data){
        this.addCommand(data
            .put("command", command)            
        );
    }



    public void addCommand(String command, RemoteObject obj, int value){
        this.addCommand(new JsonObject()
            .put("command", command)
            .put("object", of(obj))
            .put("value", value)
        );
    }


    public void addNewObject(RemoteObject obj){
        this.addCommand(new JsonObject()
            .put("command", "new")
            .put("object",obj.toJsonObject())
        );
    }
    
    public void addCommand(String commandJson){
        commands.add(commandJson);
    }

    public void addCommand(JsonSerializer command){
        addCommand(command.toJson());
    }

    public void sendCommands(String errorOnSecond){
        if (!didSubmit) {
            sendCommands();
        } else {
            System.err.println(errorOnSecond);                                
        }
    }
    
    public void sendCommands(){
        didSubmit = true;
        // System.out.println("Sending commands: [" );
        // for (String command : commands){
        //     System.out.println(command+",");
        // }
        // System.out.println("]");
        de.fau.tf.lgdv.CodeBlocks.postResult(commands.toString());        
    }
}
