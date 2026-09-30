

class MainOverride {
    public static void main(String[] args) {
        Erreichbar.main(args);
        Graph.COMMAND_BUFFER.sendCommands("Error: sendCommands called twice");    
    }
}