class Gardener extends de.fau.tf.lgdv.runtime.RemoteObject{
    private SunnyHill hill;
    private int saplingCount;
    public Gardener(){
        super("Gardener");
        this.saplingCount = (int)(Math.random() * 8) + 1;
        SunnyHill.COMMAND_BUFFER.addNewObject(this);
    }

    protected void addAttributes(de.fau.tf.lgdv.json.JsonObject json){
        json.put("saplingCount", this.saplingCount);   
    }

    public void moveToHill(SunnyHill hill){
        this.hill = hill;
        SunnyHill.COMMAND_BUFFER.addCommand("moveToHill", this, new de.fau.tf.lgdv.json.JsonObject().put("hill", hill.toJsonReference()));
    }

    public boolean hasSapling(){
        return this.saplingCount>0;
    }

    public Tree plantTree(){
        if (!hasSapling() || hill==null) return null;

        Tree tree = new Tree();
        tree.plantAtHill(hill);

        this.saplingCount--;

        return tree;
    }
}
