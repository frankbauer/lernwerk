

class MainOverride {
    public static void main(String[] args) {
        Sackgassen.main(args);
        Graph.COMMAND_BUFFER.sendCommands("Error: sendCommands called twice");    
    }
}