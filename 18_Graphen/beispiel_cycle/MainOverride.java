

class MainOverride {
    public static void main(String[] args) {
        CyclicGraph.main(args);
        Graph.COMMAND_BUFFER.sendCommands("Error: sendCommands called twice");    
    }
}