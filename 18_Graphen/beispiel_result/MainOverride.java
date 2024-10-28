

class MainOverride {
    public static void main(String[] args) {
        WorkingMax.main(args);
        Graph.COMMAND_BUFFER.sendCommands("Error: sendCommands called twice");    
    }
}