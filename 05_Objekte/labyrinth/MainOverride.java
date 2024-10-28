class MainOverride{
    public static void main(String[] args) {
        Labyrinth.main(args);
        MazeController.COMMAND_BUFFER.sendCommands("Error: sendCommands called twice");
    }
}