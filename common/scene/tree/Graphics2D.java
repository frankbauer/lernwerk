interface Renderable{
    void render(Graphics2D g);
}

class Graphics2D {   
    static final CommandBuffer COMMAND_BUFFER = new CommandBuffer();
    private final java.util.List<Renderable> objects = new java.util.LinkedList<>();
    private static Graphics2D INSTANCE;    

    public static Graphics2D instance(){
        if (INSTANCE == null){
            INSTANCE = new Graphics2D();
        }
        return INSTANCE;
    }

    public void registerForRender(Renderable r){
        this.objects.add(r);
    }

    public void render(){
        for (Renderable b : this.objects){
            b.render(this);
        }
    }

    public void drawImage(Image img, int x, int y){
        drawImage(img, x, y, 1.0, 1.0);
    }

    public void drawImage(Image img, int x, int y, double scale){
        drawImage(img, x, y,scale, scale);
    }

    public void drawImage(Image img, int x, int y, double sx, double sy){
        COMMAND_BUFFER.addCommand("drawImage", img, new JsonObject().put("x", x).put("y", y).put("sx", sx).put("sy", sy));
    }
}