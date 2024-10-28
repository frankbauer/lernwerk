class Leinwand {
    static final CommandBuffer COMMAND_BUFFER = new CommandBuffer();
    public final int zeilen;
    public final int spalten;
    private final int[][] filled;
    Leinwand(String[]args) {
        this.zeilen = Integer.parseInt(args[0]);
        this.spalten = Integer.parseInt(args[1]);
        this.filled = new int[zeilen][spalten];
        int p = 2;

        for (int r =0; r<zeilen; r++){
            for (int c =0; c<spalten; c++){
                filled[r][c] = Integer.parseInt(args[p++]);            
            }
        }
        this.setDelay(10);
    }
    public void setDelay(int delayInMs) {
        COMMAND_BUFFER.addCommand("delay", Math.max(delayInMs, 1));
    }

    public boolean istGefuellt(int r, int c) {
        if (c<0 || c>=spalten || r<0 || r>=zeilen) {
            System.err.println("Invalid cell: " + r + " / " + c);
            return true;
        }
        COMMAND_BUFFER.addCommand("test", new JsonObject().put("r", r).put("c",c));
        return this.filled[r][c] == 1;
    }

    public void fuellen(int r, int c) {
        if (c<0 || c>=spalten || r<0 || r>=zeilen) {
            System.err.println("Invalid cell: " + r + " / " + c);            
        }
        COMMAND_BUFFER.addCommand("fill", new JsonObject().put("r", r).put("c", c));
        this.filled[r][c] = 1;
    }    
}