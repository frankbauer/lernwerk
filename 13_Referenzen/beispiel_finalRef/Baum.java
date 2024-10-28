class Baum implements Renderable {
    private String jahreszeit = "herbst";

    public void setWinter(){
        this.jahreszeit = "winter";
    }

    public boolean isWinter(){
        return this.jahreszeit.equals("winter");
    }

    public void setAutumn(){
        this.jahreszeit = "herbst";
    }

    public boolean isAutum(){
        return this.jahreszeit.equals("herbst");
    }

    public void setSummer(){
        this.jahreszeit = "sommer";
    }

    public boolean isSummer(){
        return this.jahreszeit.equals("sommer");
    }

    public void setSpring(){
        this.jahreszeit = "frühling";
    }

    public boolean isSpring(){
        return this.jahreszeit.equals("frühling");
    }

    public void setLateAutumn(){
        this.jahreszeit = "spätherbst";
    }

    public boolean isLateAutum(){
        return this.jahreszeit.equals("spätherbst");
    }
  
    private final int id;
    
    private static int INSTANCE_COUNT = 0;

    public Baum() {
        this.id = ++INSTANCE_COUNT;
        Graphics2D.instance().registerForRender(this);
    }

    public Baum(String jahreszeit) {
        this.jahreszeit = jahreszeit;
        this.id = ++INSTANCE_COUNT;
        Graphics2D.instance().registerForRender(this);
    }

    public void render(Graphics2D g) {
        final int MIN_X = 150;
        final int MAX_X = 650;

        final int POS_INDEX = this.id % 3;

        final int x = (int)(POS_INDEX / 2.0 * (MAX_X - MIN_X) + MIN_X);
        final int y = 430 - Math.abs(POS_INDEX - 1) * 20;
        final double scale = 1.25 - Math.abs(POS_INDEX - 1) * 0.5;

        final Image img;
        if (this.jahreszeit.equals("herbst")) {
            img = TreeLibrary.AUTUMN;
        } else if (this.jahreszeit.equals("winter")) {
            img = TreeLibrary.WINTER;
        } else if (this.jahreszeit.equals("frühling")) {
            img = TreeLibrary.SPRING;
        } else if (this.jahreszeit.equals("sommer")) {
            img = TreeLibrary.SUMMER;
        } else if (this.jahreszeit.equals("spätherbst")) {
            img = TreeLibrary.LATE_AUTUMN;
        } else {
            img = TreeLibrary.POW;
        }

        g.drawImage(img, x, y, scale);
    }  
}