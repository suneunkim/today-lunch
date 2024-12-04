interface ProfileCardProps {
  name: string
  role: string
  about: string
  image: string
  links: { type: string; url: string }[]
}

const ProfileCard = ({ name, role, about, image, links }: ProfileCardProps) => {
  return (
    <div className='relative p-[28px] bg-customs-gray-100 h-[187px] rounded-[20px]'>
      {/* 우측 상단 모서리 css */}
      <div className='absolute top-0 right-0'>
        <div className='border-l-[49px] border-l-transparent border-t-[49px] border-t-customs-gray-90 border-b-0 border-r-0 rounded-tr-[20px]' />
      </div>

      {/* 이미지와 정보 */}
      <div className='flex gap-4'>
        <img className='w-[85px] h-[98px]' src={image} alt='프로필' />
        <div>
          <div className='text-heading3 font-paperlogy'>{name}</div>
          <div className='text-caption1 text-customs-gray-25 mt-1 mb-2'>{role}</div>
          <div className='flex gap-1 text-caption1'>
            {links.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target='_blank'
                rel='noopener noreferrer'
                className='py-[6px] px-2 rounded-[100px] border-customs-gray-10 border-[1px]'
              >
                {link.type}
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className='my-2 border-t-[1px]' />
      <p className='text-caption1 text-customs-gray-25'>{about}</p>
    </div>
  )
}

export default ProfileCard
