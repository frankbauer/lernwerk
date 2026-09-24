class Tree extends de.fau.tf.lgdv.runtime.RemoteObject{
    final int treeStyle;
    public Tree(){
        super("Tree");
        this.treeStyle = (int)(Math.random() * 16);
        SunnyHill.COMMAND_BUFFER.addNewObject(this);
    }

    protected void addAttributes(de.fau.tf.lgdv.json.JsonObject json){
        json.put("treeStyle", this.treeStyle);
    }

    public void plantAtHill(SunnyHill hill){
        hill.addTree(this);
    }
}
