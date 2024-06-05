
import * as THREE from 'three';
import {GLTFLoader} from 'GLTFLoad';
import {OrbitControls} from 'Orbit';
import {OBJLoader} from 'OBJLoad';
import {MTLLoader} from 'MTLLoad';



let camera
let scene
let cubes
let cubeText
let canvas
let renderer
let loader
let controls

function cameraSetUp(){
	const fov = 75;
	const aspect = 2; // the canvas default
	const near = 0.1;
	const far = 100;
	camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
	camera.position.z = 3;

	controls = new OrbitControls( camera, canvas );
	controls.target.set( 0, 0, 0 );
	controls.update();
}


function light(){

	const color = 0xFFFFFF;
	const intensity = 3;
	const light_1 = new THREE.DirectionalLight( color, intensity );
	light_1.position.set( 5, 10, 2 );
	scene.add( light_1 );
	scene.add( light_1.target );

	const skyColor = 0xB1E1FF; // light blue
	const groundColor = 0xB97A20; // brownish orange
	const light_2 = new THREE.HemisphereLight( skyColor, intensity );
	scene.add( light_2 );


}

function TextureStart(){

	const planeSize = 4000;

	loader = new THREE.TextureLoader();
	/*
	const texture = loader.load( 'Images/checker.png' );
	texture.colorSpace = THREE.SRGBColorSpace;
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.magFilter = THREE.NearestFilter;
	const repeats = planeSize / 200;
	texture.repeat.set( repeats, repeats );
	*/
	// 'Images\tears_of_steel_bridge_4k.exr'
	//

	/*
	const bgTexture = loader.load('Images/sky.png',
    () => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      texture.colorSpace = THREE.SRGBColorSpace;
      scene.background = texture;
	});
	bgTexture.colorSpace = THREE.SRGBColorSpace;
	scene.background = bgTexture;
	*/

	const bgTexture = loader.load('Images/Sky.png');
	bgTexture.colorSpace = THREE.SRGBColorSpace;
	scene.background = bgTexture;
	/*
	const planeGeo = new THREE.PlaneGeometry( planeSize, planeSize );
	const planeMat = new THREE.MeshPhongMaterial( {
		map: texture,
		side: THREE.DoubleSide,
	} );
	const mesh = new THREE.Mesh( planeGeo, planeMat );
	mesh.rotation.x = Math.PI * - .5;
	scene.add( mesh );
	*/

}


function loadMainModle(){

	//const GLTFloader = new GLTFLoader();

	const mtlLoader = new MTLLoader();
	mtlLoader.load( 'Images/building.mtl', ( mtl ) => {
			mtl.preload();
			const objLoader = new OBJLoader();
			objLoader.setMaterials( mtl );
			objLoader.load( 'Images/building.obj', ( root ) => {

				root.scale.setScalar(1.5);
				root.position.z =-.5
				root.position.y =-.4
				scene.add( root );

				// compute the box that contains all the stuff
				// from root and below
				const box = new THREE.Box3().setFromObject( root );

				const boxSize = box.getSize( new THREE.Vector3() ).length();
				const boxCenter = box.getCenter( new THREE.Vector3() );

				// set the camera to frame the box
				frameArea( boxSize * 1.2, boxSize, boxCenter, camera );

				// update the Trackball controls to handle the new size
				controls.maxDistance = boxSize * 10;
				controls.target.copy( boxCenter );
				controls.update();

			} );
		} );
}

function loadMainModle2(){

	const GLTFloader = new GLTFLoader();

	//const GLTFloader = new MTLLoader();
	GLTFloader.load( 'Images/old_computer_noscreen.gltf', ( glt ) => {
		glt.scene.scale.set(12,12,12)
		glt.scene.position.y = -5
		glt.scene.rotation.y = 3.15
		scene.add( glt.scene );
		} );

}

function main() {

	canvas = document.querySelector( '#c' );
	renderer = new THREE.WebGLRenderer( { antialias: true, canvas,	alpha: true, } );
	

	cameraSetUp();
	scene = new THREE.Scene();
	

	TextureStart();

	light();

	MakeCubes();

	loadMainModle();
	loadMainModle2();


	requestAnimationFrame( render );

}

function frameArea( sizeToFitOnScreen, boxSize, boxCenter, camera ) {

	const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
	const halfFovY = THREE.MathUtils.degToRad( camera.fov * .5 );
	const distance = halfSizeToFitOnScreen / Math.tan( halfFovY );
	// compute a unit vector that points in the direction the camera is now
	// in the xz plane from the center of the box
	const direction = ( new THREE.Vector3() )
		.subVectors( camera.position, boxCenter )
		.multiply( new THREE.Vector3( 1, 0, 1 ) )
		.normalize();

	// move the camera to a position distance units way from the center
	// in whatever direction the camera was from the center already
	camera.position.copy( direction.multiplyScalar( distance ).add( boxCenter ) );

	// pick some near and far values for the frustum that
	// will contain the box.
	camera.near = boxSize / 100;
	camera.far = boxSize * 100;

	camera.updateProjectionMatrix();

	// point the camera to look at the center of the box
	camera.lookAt( boxCenter.x, boxCenter.y, boxCenter.z );

}

function resizeRendererToDisplaySize( renderer ) {

	const canvasFit = renderer.domElement;
	const width = canvasFit.clientWidth;
	const height = canvasFit.clientHeight;
	const needResize = canvasFit.width !== width || canvasFit.height !== height;
	if ( needResize ) {

		renderer.setSize( width, height, false );

	}

	return needResize;
}

function loadColorTexture( path ) {

	const texture = loader.load( path );
	texture.colorSpace = THREE.SRGBColorSpace;
	return texture;

}

function makeInstance( geometry, material, x,y,z ) {

	//const material = new THREE.MeshPhongMaterial( { color } );

	const cube = new THREE.Mesh( geometry, material );
	scene.add( cube );

	cube.position.x = x;
	cube.position.y = y;
	cube.position.z = z;

	return cube;

}

function MakeCubes(){

	const boxWidth = 1;
	const boxHeight = 1;
	const boxDepth = 1;
	const geometryBox = new THREE.BoxGeometry( boxWidth, boxHeight, boxDepth );
	const geometrycone = new THREE.ConeGeometry( .5, 1, 10 );
	const geometrysphere = new THREE.SphereGeometry( .5, 10, 10 );

	let color = 0x8844aa
	const material_1 = new THREE.MeshPhongMaterial(   {color}  );
	color = 0xaa8844
	const material_2 = new THREE.MeshPhongMaterial(   {color}  );
	cubes = [
		makeInstance( geometrycone, material_1, - 2.5,1,0 ),
		makeInstance( geometrysphere, material_2, 2.5,1,0 ),

		makeInstance( geometryBox, material_2, 2,2,-2 ),
		makeInstance( geometryBox, material_2, 2,2,-2 ),
		makeInstance( geometryBox, material_2, 2,2,-2 ),
		makeInstance( geometryBox, material_2, 2,2,-2 ),
		makeInstance( geometryBox, material_2, 2,2,-2 ),

		makeInstance( geometryBox, material_2, 2,2,-2 ),
		makeInstance( geometryBox, material_2, 2,2,-2 ),
		makeInstance( geometryBox, material_2, 2,2,-2 ),
		makeInstance( geometryBox, material_2, 2,2,-2 ),
		makeInstance( geometryBox, material_2, 2,2,-2 ),

		makeInstance( geometryBox, material_2, -2,2,-2 ),
		makeInstance( geometryBox, material_2, -2,2,-2 ),
		makeInstance( geometryBox, material_2, -2,2,-2 ),
		makeInstance( geometryBox, material_2, -2,2,-2 ),
		makeInstance( geometryBox, material_2, -2,2,-2 ),

		makeInstance( geometryBox, material_2, -2,2,-2 ),
		makeInstance( geometryBox, material_2, -2,2,-2 ),
		makeInstance( geometryBox, material_2, -2,2,-2 ),
		makeInstance( geometryBox, material_2, -2,2,-2 ),
		makeInstance( geometryBox, material_2, -2,2,-2 ),
	];


	const materials = [
		new THREE.MeshBasicMaterial( { map: loadColorTexture( 'Images/Face.jpg' ) } ),
		new THREE.MeshBasicMaterial( { map: loadColorTexture( 'Images/Face.jpg' ) } ),
		new THREE.MeshBasicMaterial( { map: loadColorTexture( 'Images/Green.jpg' ) } ),
		new THREE.MeshBasicMaterial( { map: loadColorTexture( 'Images/Green.jpg' ) } ),
		new THREE.MeshBasicMaterial( { map: loadColorTexture( 'Images/EAR.jpg' ) } ),
		new THREE.MeshBasicMaterial( { map: loadColorTexture( 'Images/EAR.jpg' ) } ),
	];
	cubeText=[]
	cubeText.push( makeInstance( geometryBox,materials,0,3.5,1) ); // add to our list of cubes to rotate

	
}

function render( time ) {

	time *= 0.001; // convert time to seconds

	if ( resizeRendererToDisplaySize( renderer ) ) {

		const canvas = renderer.domElement;
		camera.aspect = canvas.clientWidth / canvas.clientHeight;
		camera.updateProjectionMatrix();

	}

	cubes.forEach( ( cube, ndx ) => {

		const speed = .5 + ndx * .1;
		const rot = time * speed;
		cube.rotation.x = rot;
		cube.rotation.y = rot;

	} );

	cubeText.forEach( ( cube, ndx ) => {

		const speed = 1 + ndx * .1;
		const rot = time * speed;
		cube.rotation.y = rot;


	} );

	renderer.render( scene, camera );

	requestAnimationFrame( render );

}


main();
