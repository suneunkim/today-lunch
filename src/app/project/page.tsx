import Container from '@/components/Container'
import ProfileCard from '@/components/ProfileCard'
import { teamData } from '../data/data'

const page = () => {
  return (
    <Container title='프로젝트 팀 소개'>
      <div className='bg-customs-gray-10 p-5 flex flex-col gap-5 pb-[110px]'>
        <div className='bg-customs-orange-50 py-2 text-center text-headline1 text-customs-gray-100 rounded-[4px]'>
          MEOKDAERI PROJECT TEAM{' '}
        </div>
        {teamData.map((member) => (
          <ProfileCard
            key={member.id}
            name={member.name}
            role={member.role}
            about={member.about}
            image={member.image}
            links={member.links}
          />
        ))}
      </div>
    </Container>
  )
}

export default page
