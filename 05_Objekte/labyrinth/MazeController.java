class MazeController {
    static final CommandBuffer COMMAND_BUFFER = new CommandBuffer();
    public final int zeilen;
    public final int spalten;
    public final int startX;
    public final int startY;
    private final int[][] filled;

    MazeController(String[]args) {
        this.startX = Integer.parseInt(args[0]);
        this.startY = Integer.parseInt(args[1]);
        this.spalten = Integer.parseInt(args[2]);
        this.zeilen = Integer.parseInt(args[3]);
        this.filled = new int[zeilen][spalten];
        int p = 4;

        for (int r =0; r<zeilen; r++){
            for (int c =0; c<spalten; c++){
                filled[r][c] = Integer.parseInt(args[p++]);            
            }
        }
    }
    public void setDelay(int delayInMs) {
        COMMAND_BUFFER.addCommand("delay", Math.max(delayInMs, 1));
    }

    public void command(int opCode){
        if (opCode == Labyrinth.GO_LEFT) {
            COMMAND_BUFFER.addCommand("left", 1);
        } else if (opCode == Labyrinth.GO_UP) {
            COMMAND_BUFFER.addCommand("up", 1);
        } else if (opCode == Labyrinth.GO_RIGHT) {
            COMMAND_BUFFER.addCommand("right", 1);
        } else if (opCode == Labyrinth.GO_DOWN) {
            COMMAND_BUFFER.addCommand("down", 1);
        } else {
            System.err.println("Unknown command: " + opCode);
        }        
    }
}