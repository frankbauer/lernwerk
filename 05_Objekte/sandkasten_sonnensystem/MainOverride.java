class MainOverride {
    public static void main(String[] args) {
        // hologram playground (common/scene/simple_universe/hologram.js): the planets orbit their sun, at a distance
        // given by setRadius and with a speed given by setSpeed
        HoloScene.start("system");
        MeinePlaneten.main(args);
        HoloScene.finish();
    }
}
