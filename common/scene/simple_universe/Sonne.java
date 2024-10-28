class Sonne {
    public Sonne(){
        this(null);
    }

    public Sonne(Universum u){
        this.universum = u;
        if (u != null) {
            u.registerSonne(this);
        }
    }

    public void print(){
        print(null);
    }

    public void print(String indent){
        if (indent == null) {
            indent = "";
        }
        System.out.println(indent + "Sonnen-System");
        for (Planet p : planeten){
            p.print(indent + "  ");
        }
    }

    private static final java.util.List<Planet> planeten = new java.util.LinkedList<>();    
    private final Universum universum;    
    void registerPlanet(Planet p){
        planeten.add(p);
    }
}
