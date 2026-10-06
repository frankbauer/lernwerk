class MainOverride {
    public static void main(String[] args) {
        // hologram playground (common/scene/simple_universe/hologram.js): one column per class, every new object
        // appears in its class's column, labelled with the variables that reference it
        HoloScene.start("instances");
        // the exercise asks for the default constructors: suns without universe and planets without sun are the
        // correct solution here, so they are not tinted red
        HoloScene.showOrphans(false);
        MeineInstanzen.main(args);
        HoloScene.finish();
    }
}
