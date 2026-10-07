interface Renderable{
    void render(Graphics2D g);
}

class Graphics2D {   
    static final de.fau.tf.lgdv.runtime.CommandBuffer COMMAND_BUFFER = new de.fau.tf.lgdv.runtime.CommandBuffer();
    private final java.util.List<Renderable> objects = new java.util.LinkedList<>();
    private static Graphics2D INSTANCE;    
    // index of the object that is rendering right now (-1 outside render()): the canvas uses it to recognise the
    // same object in a later frame, e.g. to animate a change of its image
    private int current = -1;

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
        int index = 0;
        for (Renderable b : this.objects){
            this.current = index++;
            b.render(this);
        }
        this.current = -1;
    }

    public void drawImage(Image img, int x, int y){
        drawImage(img, x, y, 1.0, 1.0);
    }

    public void drawImage(Image img, int x, int y, double scale){
        drawImage(img, x, y,scale, scale);
    }

    public void drawImage(Image img, int x, int y, double sx, double sy){
        de.fau.tf.lgdv.json.JsonObject args = new de.fau.tf.lgdv.json.JsonObject().put("x", x).put("y", y).put("sx", sx).put("sy", sy);
        if (this.current >= 0) {
            args.put("key", this.current);
        }
        COMMAND_BUFFER.addCommand("drawImage", img, args);
    }
}